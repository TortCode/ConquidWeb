import axios from 'axios'

const baseUrl = 'http://localhost:3000/api/login'

const login = async (username: string, password: string): Promise<{ token: string, username: string, id: string }> => {
  const response = await axios.post(baseUrl, { username, password })
  return response.data
}

export default { login }
