export const USSD_STATES = {
  IDLE: 'IDLE',
  DIALING: 'DIALING',
  CHECKING_USER: 'CHECKING_USER',
  AWAITING_PIN_SETUP: 'AWAITING_PIN_SETUP',
  AWAITING_PIN_CONFIRM: 'AWAITING_PIN_CONFIRM',
  ACTIVATING: 'ACTIVATING',
  ACTIVATED: 'ACTIVATED',
  MAIN_MENU: 'MAIN_MENU',
  // Balance
  AWAITING_PIN_BALANCE: 'AWAITING_PIN_BALANCE',
  LOADING_BALANCE: 'LOADING_BALANCE',
  SHOWING_BALANCE: 'SHOWING_BALANCE',
  // Transfer
  AWAITING_PIN_TRANSFER: 'AWAITING_PIN_TRANSFER',
  AWAITING_RECIPIENT: 'AWAITING_RECIPIENT',
  AWAITING_AMOUNT: 'AWAITING_AMOUNT',
  CONFIRM_TRANSFER: 'CONFIRM_TRANSFER',
  PROCESSING_TRANSFER: 'PROCESSING_TRANSFER',
  TRANSFER_SUCCESS: 'TRANSFER_SUCCESS',
  // End
  SESSION_ENDED: 'SESSION_ENDED',
} as const;

export type UssdState = (typeof USSD_STATES)[keyof typeof USSD_STATES];

export const MENUS = {
  WELCOME: 'Welcome to USSD\n\nPress * to dial *123#',
  DIALING: 'Dialing: ',
  CHECKING: 'Connecting...',
  NOT_REGISTERED: 'User not registered.\n\nPlease register first.',
  WELCOME_NEW: 'Welcome to UNDP Wallet.\nThis is your first time.\n\nPlease set your 4-digit PIN:',
  CONFIRM_PIN: 'Confirm your PIN:',
  PIN_MISMATCH: 'PINs do not match.\n\nPlease set your 4-digit PIN:',
  ACTIVATING: 'Creating your wallet...\nPlease wait.',
  ACCOUNT_ACTIVATED: 'Account Activated!\n\nWallet: {address}\n\nPress OK for menu',
  WELCOME_BACK: 'Welcome back to UNDP Wallet.\n\nEnter your 4-digit PIN:',
  INVALID_PIN: 'Invalid PIN.\n\nSession ended.',
  MAIN_MENU: 'UNDP Wallet\n\n1. Check Balance\n2. Transfer\n3. Exit\n\nSelect option:',
  // Balance
  ENTER_PIN_BALANCE: 'Check Balance\n\nEnter your 4-digit PIN:',
  LOADING_BALANCE: 'Loading balance...',
  BALANCE_DISPLAY: 'Your Balance:\n\n{balance} USDC\n\nPress OK for menu',
  // Transfer
  ENTER_RECIPIENT: 'Transfer\n\nEnter recipient\nphone number:',
  ENTER_AMOUNT: 'Current Balance: {balance} USDC\n\nEnter amount to send:',
  ENTER_PIN_TRANSFER: 'Enter your 4-digit PIN\nto confirm:',
  CONFIRM_TRANSFER: 'Send {amount} USDC to\n{recipient}?\n\n1. Yes\n2. No',
  PROCESSING_TRANSFER: 'Processing transfer...\nPlease wait.',
  TRANSFER_SUCCESS: 'Transfer Success!\n\nTxHash:\n{txHash}\n\nPress OK for menu',
  TRANSFER_FAILED: 'Transfer Failed.\n\nRecipient is invalid.\n\nPress OK for menu',
  // End
  SESSION_ENDED: 'Thank you for using\nUNDP Wallet.\n\nGoodbye!',
} as const;
