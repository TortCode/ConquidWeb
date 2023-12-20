import axios from 'axios'

const baseUrl = 'http://localhost:3000/api/users'

const createUser = async (username: string, name: string, password: string): Promise<{ username: string, name: string, id: string }> => {
  const response = await axios.post(baseUrl, { username, name, password })
  return response.data
}

export default { createUser }
