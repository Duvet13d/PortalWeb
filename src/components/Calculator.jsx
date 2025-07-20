import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ariaUtils, keyboardUtils } from '../utils/accessibility'

const Calculator = () => {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState('0')
  const [isShowingResult, setIsShowingResult] = useState(false)
  const inputRef = useRef(null)

  // Focus the input when component mounts
  // useEffect(() => {
  //   if (inputRef.current) {
  //     inputRef.current.focus()
  //   }
  // }, [])

  // Safe evaluation function
  const evaluateExpression = (expr) => {
    try {
      // Remove any non-allowed characters for security
      const sanitized = expr.replace(/[^0-9+\-*/.() ]/g, '')
      if (!sanitized) return '0'
      
      // Use Function constructor for safer evaluation than eval
      const result = Function('"use strict"; return (' + sanitized + ')')()
      
      // Check if result is a valid number
      if (isNaN(result) || !isFinite(result)) {
        return 'Error'
      }
      
      return result.toString()
    } catch (error) {
      return 'Error'
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setExpression(value)
    setIsShowingResult(false)
    
    // Try to evaluate as user types for instant feedback
    if (value.trim()) {
      const evalResult = evaluateExpression(value)
      setResult(evalResult)
    } else {
      setResult('0')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      calculate()
    }
  }

  const calculate = () => {
    if (!expression.trim()) return
    
    const evalResult = evaluateExpression(expression)
    setResult(evalResult)
    setIsShowingResult(true)
    
    // Announce result to screen readers
    ariaUtils.announce(`Result: ${evalResult}`)
    
    // If result is valid, replace expression with result
    if (evalResult !== 'Error') {
      setExpression(evalResult)
    }
  }

  const clear = () => {
    setExpression('')
    setResult('0')
    setIsShowingResult(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const insertOperator = (operator) => {
    const currentValue = expression
    let newValue = currentValue + operator
    
    // If the last character is already an operator, replace it
    if (currentValue && /[+\-*/]$/.test(currentValue)) {
      newValue = currentValue.slice(0, -1) + operator
    }
    
    setExpression(newValue)
    setIsShowingResult(false)
    
    // Focus back to input
    if (inputRef.current) {
      inputRef.current.focus()
      // Move cursor to end
      setTimeout(() => {
        inputRef.current.setSelectionRange(newValue.length, newValue.length)
      }, 0)
    }
  }

  const insertNumber = (num) => {
    const newValue = expression + num
    setExpression(newValue)
    setIsShowingResult(false)
    
    // Focus back to input
    if (inputRef.current) {
      inputRef.current.focus()
      // Move cursor to end
      setTimeout(() => {
        inputRef.current.setSelectionRange(newValue.length, newValue.length)
      }, 0)
    }
  }

  const insertDecimal = () => {
    const currentValue = expression
    
    // Check if current number already has a decimal
    const parts = currentValue.split(/[+\-*/]/)
    const lastPart = parts[parts.length - 1]
    
    if (!lastPart.includes('.')) {
      const newValue = currentValue + '.'
      setExpression(newValue)
      setIsShowingResult(false)
      
      if (inputRef.current) {
        inputRef.current.focus()
        setTimeout(() => {
          inputRef.current.setSelectionRange(newValue.length, newValue.length)
        }, 0)
      }
    }
  }

  const Button = ({ onClick, className = '', children, ariaLabel, ...props }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onKeyDown={(e) => keyboardUtils.handleActivation(e, onClick)}
      className={`h-16 rounded-lg font-semibold text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:ring-offset-2 focus:ring-offset-gray-900 ${className}`}
      aria-label={ariaLabel || children}
      {...props}
    >
      {children}
    </motion.button>
  )

  return (
    <div 
      className="w-full max-w-sm mx-auto bg-white bg-opacity-5 rounded-xl p-6 backdrop-blur-sm"
      role="application"
      aria-label="Calculator"
    >
      <div className="mb-4">
        <label htmlFor="calculator-input" className="sr-only">
          Calculator expression input
        </label>
        <input
          id="calculator-input"
          ref={inputRef}
          type="text"
          value={expression}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter Here or Below"
          className="w-full p-4 bg-black bg-opacity-50 rounded-lg text-white text-right text-xl font-mono focus:outline-none focus:ring-2 focus:ring-accent-1 placeholder-gray-400"
          aria-describedby="calculator-result"
          autoComplete="off"
        />
        <div 
          id="calculator-result"
          className="mt-2 p-2 text-right text-lg font-mono text-gray-300"
          aria-live="polite"
          aria-label={`Result: ${result}`}
        >
          = {result}
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <Button
          onClick={clear}
          className="col-span-2 bg-accent-1 hover:bg-red-600 text-white"
          ariaLabel="Clear calculator"
        >
          Clear
        </Button>
        <Button
          onClick={() => insertOperator('/')}
          className="bg-accent-2 hover:bg-orange-600 text-white"
          ariaLabel="Divide"
        >
          ÷
        </Button>
        <Button
          onClick={() => insertOperator('*')}
          className="bg-accent-2 hover:bg-orange-600 text-white"
          ariaLabel="Multiply"
        >
          ×
        </Button>

        <Button
          onClick={() => insertNumber('7')}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
        >
          7
        </Button>
        <Button
          onClick={() => insertNumber('8')}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
        >
          8
        </Button>
        <Button
          onClick={() => insertNumber('9')}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
        >
          9
        </Button>
        <Button
          onClick={() => insertOperator('-')}
          className="bg-accent-2 hover:bg-orange-600 text-white"
          ariaLabel="Subtract"
        >
          −
        </Button>

        <Button
          onClick={() => insertNumber('4')}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
          ariaLabel="4"
        >
          4
        </Button>
        <Button
          onClick={() => insertNumber('5')}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
          ariaLabel="5"
        >
          5
        </Button>
        <Button
          onClick={() => insertNumber('6')}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
          ariaLabel="6"
        >
          6
        </Button>
        <Button
          onClick={() => insertOperator('+')}
          className="bg-accent-2 hover:bg-orange-600 text-white"
          ariaLabel="Add"
        >
          +
        </Button>

        <Button
          onClick={() => insertNumber('1')}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
          ariaLabel="1"
        >
          1
        </Button>
        <Button
          onClick={() => insertNumber('2')}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
          ariaLabel="2"
        >
          2
        </Button>
        <Button
          onClick={() => insertNumber('3')}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
          ariaLabel="3"
        >
          3
        </Button>
        <Button
          onClick={calculate}
          className="row-span-2 bg-accent-1 hover:bg-red-600 text-white"
          ariaLabel="Calculate result"
        >
          =
        </Button>

        <Button
          onClick={() => insertNumber('0')}
          className="col-span-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
          ariaLabel="0"
        >
          0
        </Button>
        <Button
          onClick={insertDecimal}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
          ariaLabel="Decimal point"
        >
          .
        </Button>
      </div>
    </div>
  )
}

export default Calculator 