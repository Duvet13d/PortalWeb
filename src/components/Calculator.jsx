import { useState } from 'react'
import { motion } from 'framer-motion'

const Calculator = () => {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num))
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? String(num) : display + num)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.')
    }
  }

  const clear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperator(null)
    setWaitingForOperand(false)
  }

  const performOperation = (nextOperator) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operator) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operator)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperator(nextOperator)
  }

  const calculate = (firstValue, secondValue, operator) => {
    switch (operator) {
      case '+':
        return firstValue + secondValue
      case '-':
        return firstValue - secondValue
      case '*':
        return firstValue * secondValue
      case '/':
        return firstValue / secondValue
      case '=':
        return secondValue
      default:
        return secondValue
    }
  }

  const handleEquals = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operator) {
      const newValue = calculate(previousValue, inputValue, operator)
      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperator(null)
      setWaitingForOperand(true)
    }
  }

  const Button = ({ onClick, className = '', children, ...props }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`h-16 rounded-lg font-semibold text-lg transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )

  return (
    <div className="w-full max-w-sm mx-auto bg-white bg-opacity-5 rounded-xl p-6 backdrop-blur-sm">
      <div className="mb-4 p-4 bg-black bg-opacity-50 rounded-lg">
        <div className="text-right text-3xl font-mono text-white break-all">
          {display}
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <Button
          onClick={clear}
          className="col-span-2 bg-accent-1 hover:bg-red-600 text-white"
        >
          Clear
        </Button>
        <Button
          onClick={() => performOperation('/')}
          className="bg-accent-2 hover:bg-orange-600 text-white"
        >
          ÷
        </Button>
        <Button
          onClick={() => performOperation('*')}
          className="bg-accent-2 hover:bg-orange-600 text-white"
        >
          ×
        </Button>

        <Button
          onClick={() => inputNumber(7)}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
        >
          7
        </Button>
        <Button
          onClick={() => inputNumber(8)}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
        >
          8
        </Button>
        <Button
          onClick={() => inputNumber(9)}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
        >
          9
        </Button>
        <Button
          onClick={() => performOperation('-')}
          className="bg-accent-2 hover:bg-orange-600 text-white"
        >
          −
        </Button>

        <Button
          onClick={() => inputNumber(4)}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
        >
          4
        </Button>
        <Button
          onClick={() => inputNumber(5)}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
        >
          5
        </Button>
        <Button
          onClick={() => inputNumber(6)}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
        >
          6
        </Button>
        <Button
          onClick={() => performOperation('+')}
          className="bg-accent-2 hover:bg-orange-600 text-white"
        >
          +
        </Button>

        <Button
          onClick={() => inputNumber(1)}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
        >
          1
        </Button>
        <Button
          onClick={() => inputNumber(2)}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
        >
          2
        </Button>
        <Button
          onClick={() => inputNumber(3)}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
        >
          3
        </Button>
        <Button
          onClick={handleEquals}
          className="row-span-2 bg-accent-1 hover:bg-red-600 text-white"
        >
          =
        </Button>

        <Button
          onClick={() => inputNumber(0)}
          className="col-span-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
        >
          0
        </Button>
        <Button
          onClick={inputDecimal}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
        >
          .
        </Button>
      </div>
    </div>
  )
}

export default Calculator 