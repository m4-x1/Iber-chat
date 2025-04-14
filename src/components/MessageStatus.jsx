
import React from 'react'
import { motion } from 'framer-motion'

function MessageStatus({ status }) {
  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return '⩗'
      case 'delivered':
        return '⩗⩗'
      case 'read':
        return <span className="text-blue-400">⩗⩗</span>
      default:
        return null
    }
  }

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="inline-flex items-center"
    >
      {getStatusIcon()}
    </motion.span>
  )
}

export default MessageStatus
