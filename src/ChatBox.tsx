import React, { useState } from 'react'
import { message, data } from './data/data'

const ChatBox = () => {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(data)
  const appendMessage = (message: message) => {
    console.log(message)
    setMessages(messages.concat(message))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(name)
    console.log(message)
    if (name && message) {
      const toAppend: message = {
        id: +Date.now().toString(),
        userName: name,
        message,
      }
      appendMessage(toAppend)
    }
  }
  console.log(data)
  return (
    <>
      <div className='chatBox'></div>
      {messages.map((message) => {
        return (
          <div id={'' + message.id}>
            <h2>{message.userName}</h2>
            <p>{message.message}</p>
          </div>
        )
      })}
      <form className='form' onSubmit={handleSubmit}>
        <label htmlFor='name'>Name : </label>
        <input
          type='text'
          id='name'
          name='name'
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
        />
        <label htmlFor='message'>Message : </label>
        <input
          type='text'
          id='message'
          name='message'
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
          }}
        />
        <button className='btn' type='submit'>
          Send
        </button>
      </form>
    </>
  )
}

export default ChatBox
