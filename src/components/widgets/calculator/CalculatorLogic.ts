
export type OperationType = '+' | '-' | '*' | '/' | null;

export const performCalculation = (a: number, b: number, op: string): number => {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b !== 0 ? a / b : 0;
    default: return b;
  }
};

export const handleDigitPress = (
  digit: string,
  currentInput: string,
  waitingForOperand: boolean
): { newInput: string; newWaitingForOperand: boolean } => {
  if (waitingForOperand) {
    return { newInput: digit, newWaitingForOperand: false };
  } else {
    return { newInput: currentInput === '0' ? digit : currentInput + digit, newWaitingForOperand: false };
  }
};

export const handleDecimalPress = (
  currentInput: string,
  waitingForOperand: boolean
): { newInput: string; newWaitingForOperand: boolean } => {
  if (waitingForOperand) {
    return { newInput: '0.', newWaitingForOperand: false };
  } else if (currentInput.indexOf('.') === -1) {
    return { newInput: currentInput + '.', newWaitingForOperand: false };
  }
  return { newInput: currentInput, newWaitingForOperand: false };
};

export const handleOperatorPress = (
  nextOperator: string,
  currentInput: string,
  prevValue: string | null,
  currentOperator: OperationType
): { newPrevValue: string; newInput: string; newOperator: OperationType; newWaitingForOperand: boolean } => {
  const inputValue = parseFloat(currentInput);

  if (prevValue === null) {
    return { 
      newPrevValue: currentInput, 
      newInput: currentInput, 
      newOperator: nextOperator as OperationType, 
      newWaitingForOperand: true 
    };
  } else if (currentOperator) {
    const result = performCalculation(parseFloat(prevValue), inputValue, currentOperator);
    return { 
      newPrevValue: String(result), 
      newInput: String(result), 
      newOperator: nextOperator as OperationType, 
      newWaitingForOperand: true 
    };
  }
  return { 
    newPrevValue: prevValue, 
    newInput: currentInput, 
    newOperator: nextOperator as OperationType, 
    newWaitingForOperand: true 
  };
};

export const handleEqualPress = (
  currentInput: string,
  prevValue: string | null,
  operator: OperationType
): { newInput: string; newPrevValue: string | null; newOperator: OperationType; newWaitingForOperand: boolean } => {
  if (!operator || prevValue === null) {
    return { 
      newInput: currentInput, 
      newPrevValue: prevValue, 
      newOperator: operator, 
      newWaitingForOperand: false 
    };
  }

  const inputValue = parseFloat(currentInput);
  const result = performCalculation(parseFloat(prevValue), inputValue, operator);
  
  return { 
    newInput: String(result), 
    newPrevValue: null, 
    newOperator: null, 
    newWaitingForOperand: true 
  };
};

export const handleClearAll = (): { 
  newInput: string; 
  newPrevValue: null; 
  newOperator: null;
  newWaitingForOperand: boolean;
} => {
  return { 
    newInput: '0', 
    newPrevValue: null, 
    newOperator: null, 
    newWaitingForOperand: false 
  };
};

export const handlePlusMinus = (currentInput: string): string => {
  const value = parseFloat(currentInput);
  return String(-value);
};

export const handlePercentage = (currentInput: string): string => {
  const value = parseFloat(currentInput);
  return String(value / 100);
};

export const handleDelete = (currentInput: string): string => {
  if (currentInput.length === 1) {
    return '0';
  } else {
    return currentInput.slice(0, -1);
  }
};
