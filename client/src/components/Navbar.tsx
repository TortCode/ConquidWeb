import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = (): JSX.Element => {
  return (
    <nav>
      <Link to="/game">Game</Link>
      <Link to="/signup">Signup</Link>
      <Link to="/login">Login</Link>
      <Link to="/gamefinder">Find Games</Link>
    </nav>
  )
}

export default Navbar
