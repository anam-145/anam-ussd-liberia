'use client';

import { useState, useCallback, useRef } from 'react';
import { USSD_STATES, MENUS } from '@/constants/ussd-menus';
import type { UssdState } from '@/constants/ussd-menus';

interface UserInfo {
  registered: boolean;
  status?: 'PENDING' | 'ACTIVE';
  name?: string;
  walletAddress?: string;
}

interface UssdSession {
  state: UssdState;
  display: string;
  inputBuffer: string;
  phoneNumber: string;
  tempPin: string;
  userInfo: UserInfo | null;
  // Transfer
  transferPin: string;
  transferRecipient: string;
  transferAmount: string;
  currentBalance: string;
}

export function useUssdSession(initialPhoneNumber: string) {
  const [session, setSession] = useState<UssdSession>({
    state: USSD_STATES.IDLE,
    display: MENUS.WELCOME,
    inputBuffer: '',
    phoneNumber: initialPhoneNumber,
    tempPin: '',
    userInfo: null,
    transferPin: '',
    transferRecipient: '',
    transferAmount: '',
    currentBalance: '',
  });

  const sessionRef = useRef(session);
  sessionRef.current = session;

  const updateSession = useCallback((updates: Partial<UssdSession>) => {
    setSession((prev) => ({ ...prev, ...updates }));
  }, []);

  const setPhoneNumber = useCallback(
    (phone: string) => {
      updateSession({ phoneNumber: phone });
    },
    [updateSession],
  );

  // API: 사용자 등록 여부 체크
  const checkUser = useCallback(async (phone: string): Promise<UserInfo> => {
    try {
      const res = await fetch(`/api/ussd/check?phoneNumber=${encodeURIComponent(phone)}`);
      return await res.json();
    } catch {
      return { registered: false };
    }
  }, []);

  // API: 계정 활성화
  const activateUser = useCallback(async (phone: string, pin: string) => {
    try {
      const res = await fetch('/api/ussd/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, pin }),
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, []);

  // API: 잔고 조회
  const getBalance = useCallback(async (phone: string) => {
    try {
      const res = await fetch(`/api/ussd/balance?phoneNumber=${encodeURIComponent(phone)}`);
      return await res.json();
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, []);

  // API: 송금
  const transfer = useCallback(async (phone: string, pin: string, toPhone: string, amount: string) => {
    try {
      const res = await fetch('/api/ussd/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, pin, toPhoneNumber: toPhone, amount }),
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, []);

  // 세션 리셋
  const resetSession = useCallback(() => {
    setSession((prev) => ({
      state: USSD_STATES.IDLE,
      display: MENUS.WELCOME,
      inputBuffer: '',
      phoneNumber: prev.phoneNumber,
      tempPin: '',
      userInfo: null,
      transferPin: '',
      transferRecipient: '',
      transferAmount: '',
      currentBalance: '',
    }));
  }, []);

  // OK 버튼 처리
  const handleOkPress = useCallback(async () => {
    const { state, inputBuffer, phoneNumber, tempPin, transferPin, transferRecipient, transferAmount } =
      sessionRef.current;

    if (state === USSD_STATES.AWAITING_PIN_SETUP) {
      if (inputBuffer.length !== 4 || !/^\d{4}$/.test(inputBuffer)) {
        updateSession({
          display: 'PIN must be 4 digits.\n\nPlease set your 4-digit PIN:',
          inputBuffer: '',
        });
        return;
      }

      updateSession({
        state: USSD_STATES.AWAITING_PIN_CONFIRM,
        display: MENUS.CONFIRM_PIN,
        tempPin: inputBuffer,
        inputBuffer: '',
      });
      return;
    }

    if (state === USSD_STATES.AWAITING_PIN_CONFIRM) {
      if (inputBuffer !== tempPin) {
        updateSession({
          state: USSD_STATES.AWAITING_PIN_SETUP,
          display: MENUS.PIN_MISMATCH,
          inputBuffer: '',
          tempPin: '',
        });
        return;
      }

      updateSession({
        state: USSD_STATES.ACTIVATING,
        display: MENUS.ACTIVATING,
        inputBuffer: '',
      });

      const result = await activateUser(phoneNumber, inputBuffer);

      if (result.success) {
        updateSession({
          state: USSD_STATES.ACTIVATED,
          display: MENUS.ACCOUNT_ACTIVATED.replace('{address}', result.walletAddress?.slice(0, 10) + '...'),
        });
      } else {
        updateSession({
          state: USSD_STATES.SESSION_ENDED,
          display: `Activation failed.\n${result.error || 'Unknown error'}`,
        });
      }
      return;
    }

    if (state === USSD_STATES.ACTIVATED) {
      // OK 누르면 메인 메뉴로
      updateSession({
        state: USSD_STATES.MAIN_MENU,
        display: MENUS.MAIN_MENU,
        inputBuffer: '',
      });
      return;
    }

    if (state === USSD_STATES.MAIN_MENU) {
      const choice = inputBuffer;
      if (choice === '1') {
        // 잔고 조회 - 바로 API 호출
        updateSession({
          state: USSD_STATES.LOADING_BALANCE,
          display: MENUS.LOADING_BALANCE,
          inputBuffer: '',
        });

        const result = await getBalance(phoneNumber);

        if (result.success) {
          updateSession({
            state: USSD_STATES.SHOWING_BALANCE,
            display: MENUS.BALANCE_DISPLAY.replace('{balance}', result.balance),
            currentBalance: result.balance,
          });
        } else {
          updateSession({
            state: USSD_STATES.MAIN_MENU,
            display: `Balance check failed.\n${result.error || 'Unknown error'}\n\nPress OK for menu`,
          });
        }
        return;
      } else if (choice === '2') {
        // 송금 - PIN 입력
        updateSession({
          state: USSD_STATES.AWAITING_PIN_TRANSFER,
          display: MENUS.ENTER_PIN_TRANSFER,
          inputBuffer: '',
        });
      } else if (choice === '3') {
        updateSession({
          state: USSD_STATES.SESSION_ENDED,
          display: MENUS.SESSION_ENDED,
          inputBuffer: '',
        });
      }
      return;
    }

    // 잔고 표시 후 OK → 메인 메뉴
    if (state === USSD_STATES.SHOWING_BALANCE) {
      updateSession({
        state: USSD_STATES.MAIN_MENU,
        display: MENUS.MAIN_MENU,
        inputBuffer: '',
      });
      return;
    }

    // 송금 - PIN 입력 후
    if (state === USSD_STATES.AWAITING_PIN_TRANSFER) {
      if (inputBuffer === '0') {
        updateSession({ state: USSD_STATES.MAIN_MENU, display: MENUS.MAIN_MENU, inputBuffer: '' });
        return;
      }
      if (inputBuffer.length !== 4 || !/^\d{4}$/.test(inputBuffer)) {
        updateSession({
          display: 'PIN must be 4 digits.\n\n' + MENUS.ENTER_PIN_TRANSFER,
          inputBuffer: '',
        });
        return;
      }

      // 잔고 조회해서 표시
      const balanceResult = await getBalance(phoneNumber);
      const balance = balanceResult.success ? balanceResult.balance : '0';

      updateSession({
        state: USSD_STATES.AWAITING_RECIPIENT,
        display: MENUS.ENTER_RECIPIENT,
        transferPin: inputBuffer,
        currentBalance: balance,
        inputBuffer: '',
      });
      return;
    }

    // 수신자 입력 후
    if (state === USSD_STATES.AWAITING_RECIPIENT) {
      if (inputBuffer === '0') {
        updateSession({ state: USSD_STATES.MAIN_MENU, display: MENUS.MAIN_MENU, inputBuffer: '', transferPin: '' });
        return;
      }
      if (!/^\d{9}$/.test(inputBuffer)) {
        updateSession({
          display: 'Invalid number.\nMust be 9 digits.\n\n' + MENUS.ENTER_RECIPIENT,
          inputBuffer: '',
        });
        return;
      }
      const recipientFull = '+231' + inputBuffer;
      if (recipientFull === phoneNumber) {
        updateSession({
          display: 'Cannot send to yourself.\n\n' + MENUS.ENTER_RECIPIENT,
          inputBuffer: '',
        });
        return;
      }

      updateSession({
        state: USSD_STATES.AWAITING_AMOUNT,
        display: MENUS.ENTER_AMOUNT.replace('{balance}', sessionRef.current.currentBalance),
        transferRecipient: recipientFull,
        inputBuffer: '',
      });
      return;
    }

    // 금액 입력 후
    if (state === USSD_STATES.AWAITING_AMOUNT) {
      if (inputBuffer === '0') {
        updateSession({
          state: USSD_STATES.AWAITING_RECIPIENT,
          display: MENUS.ENTER_RECIPIENT,
          inputBuffer: '',
          transferRecipient: '',
        });
        return;
      }
      const amount = parseFloat(inputBuffer);
      const currentBal = parseFloat(sessionRef.current.currentBalance) || 0;
      if (isNaN(amount) || amount <= 0) {
        updateSession({
          display: 'Invalid amount.\n\n' + MENUS.ENTER_AMOUNT.replace('{balance}', sessionRef.current.currentBalance),
          inputBuffer: '',
        });
        return;
      }
      if (amount > currentBal) {
        updateSession({
          display:
            'Insufficient balance.\n\n' + MENUS.ENTER_AMOUNT.replace('{balance}', sessionRef.current.currentBalance),
          inputBuffer: '',
        });
        return;
      }

      updateSession({
        state: USSD_STATES.CONFIRM_TRANSFER,
        display: MENUS.CONFIRM_TRANSFER.replace('{amount}', inputBuffer).replace('{recipient}', transferRecipient),
        transferAmount: inputBuffer,
        inputBuffer: '',
      });
      return;
    }

    // 송금 확인
    if (state === USSD_STATES.CONFIRM_TRANSFER) {
      if (inputBuffer === '0') {
        updateSession({
          state: USSD_STATES.AWAITING_AMOUNT,
          display: MENUS.ENTER_AMOUNT.replace('{balance}', sessionRef.current.currentBalance),
          inputBuffer: '',
          transferAmount: '',
        });
        return;
      }
      if (inputBuffer === '1') {
        updateSession({
          state: USSD_STATES.PROCESSING_TRANSFER,
          display: MENUS.PROCESSING_TRANSFER,
          inputBuffer: '',
        });

        const result = await transfer(phoneNumber, transferPin, transferRecipient, transferAmount);

        if (result.success) {
          updateSession({
            state: USSD_STATES.TRANSFER_SUCCESS,
            display: MENUS.TRANSFER_SUCCESS.replace('{txHash}', result.txHash?.slice(0, 20) + '...'),
          });
        } else {
          updateSession({
            state: USSD_STATES.MAIN_MENU,
            display: MENUS.TRANSFER_FAILED,
          });
        }
      } else if (inputBuffer === '2') {
        updateSession({
          state: USSD_STATES.MAIN_MENU,
          display: MENUS.MAIN_MENU,
          inputBuffer: '',
          transferPin: '',
          transferRecipient: '',
          transferAmount: '',
        });
      }
      return;
    }

    // 송금 성공 후 OK → 메인 메뉴
    if (state === USSD_STATES.TRANSFER_SUCCESS) {
      updateSession({
        state: USSD_STATES.MAIN_MENU,
        display: MENUS.MAIN_MENU,
        inputBuffer: '',
        transferPin: '',
        transferRecipient: '',
        transferAmount: '',
      });
      return;
    }
  }, [updateSession, activateUser, getBalance, transfer]);

  // 키 입력 처리
  const handleKeyPress = useCallback(
    async (key: string) => {
      const { state, inputBuffer, phoneNumber, display } = sessionRef.current;

      if (state === USSD_STATES.IDLE) {
        if (key === '*') {
          updateSession({
            state: USSD_STATES.DIALING,
            inputBuffer: '*',
            display: MENUS.DIALING + '*',
          });
        }
        return;
      }

      if (state === USSD_STATES.DIALING) {
        // 숫자 및 # 입력
        if (['1', '2', '3', '#'].includes(key)) {
          const newBuffer = inputBuffer + key;
          updateSession({
            inputBuffer: newBuffer,
            display: MENUS.DIALING + newBuffer,
          });
        }

        // 백스페이스
        if (key === 'backspace') {
          if (inputBuffer.length > 1) {
            const newBuffer = inputBuffer.slice(0, -1);
            updateSession({
              inputBuffer: newBuffer,
              display: MENUS.DIALING + newBuffer,
            });
          } else {
            // 전부 지우면 IDLE로
            resetSession();
          }
          return;
        }

        // 통화 버튼으로 다이얼 실행
        if ((key === 'send' || key === 'ok') && inputBuffer === '*123#') {
          updateSession({
            state: USSD_STATES.CHECKING_USER,
            display: MENUS.CHECKING,
            inputBuffer: '',
          });

          const userInfo = await checkUser(phoneNumber);
          updateSession({ userInfo });

          if (!userInfo.registered) {
            updateSession({
              state: USSD_STATES.SESSION_ENDED,
              display: MENUS.NOT_REGISTERED,
            });
          } else if (userInfo.status === 'PENDING') {
            updateSession({
              state: USSD_STATES.AWAITING_PIN_SETUP,
              display: MENUS.WELCOME_NEW,
            });
          } else if (userInfo.status === 'ACTIVE') {
            // ACTIVE 유저는 바로 메인 메뉴로
            updateSession({
              state: USSD_STATES.MAIN_MENU,
              display: MENUS.MAIN_MENU,
            });
          }
        }
        return;
      }

      if (key === 'ok' || key === 'send') {
        await handleOkPress();
        return;
      }

      // 백스페이스 처리
      if (key === 'backspace') {
        if (inputBuffer.length > 0) {
          const newBuffer = inputBuffer.slice(0, -1);
          const baseDisplay = display.split('\n\n> ')[0];
          updateSession({
            inputBuffer: newBuffer,
            display: newBuffer ? baseDisplay + '\n\n> ' + newBuffer : baseDisplay,
          });
        }
        return;
      }

      if (key.match(/[0-9]/)) {
        const inputStates: UssdState[] = [
          USSD_STATES.AWAITING_PIN_SETUP,
          USSD_STATES.AWAITING_PIN_CONFIRM,
          USSD_STATES.MAIN_MENU,
          USSD_STATES.AWAITING_PIN_TRANSFER,
          USSD_STATES.AWAITING_RECIPIENT,
          USSD_STATES.AWAITING_AMOUNT,
          USSD_STATES.CONFIRM_TRANSFER,
        ];
        const pinStates: UssdState[] = [
          USSD_STATES.AWAITING_PIN_SETUP,
          USSD_STATES.AWAITING_PIN_CONFIRM,
          USSD_STATES.AWAITING_PIN_TRANSFER,
        ];
        if (inputStates.includes(state)) {
          const newBuffer = inputBuffer + key;
          const baseDisplay = display.split('\n\n> ')[0];
          const displayValue = pinStates.includes(state) ? '*'.repeat(newBuffer.length) : newBuffer;
          updateSession({
            inputBuffer: newBuffer,
            display: baseDisplay + '\n\n> ' + displayValue,
          });
        }
      }
    },
    [updateSession, checkUser, handleOkPress, resetSession],
  );

  return {
    ...session,
    setPhoneNumber,
    handleKeyPress,
    resetSession,
  };
}
