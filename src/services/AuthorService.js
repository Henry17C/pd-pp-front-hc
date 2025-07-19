import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/app-authors'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
})

// Interceptor para logging
api.interceptors.request.use(
  config => {
    console.log('Realizando petición:', config.method.toUpperCase(), config.url)
    console.log('URL completa:', config.baseURL + config.url)
    return config
  },
  error => {
    console.error('Error en petición:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    console.log('Respuesta recibida:', response.status, response.data)
    return response
  },
  error => {
    console.error('Error en respuesta:', error.message)
    if (error.response) {
      console.error('Datos del error:', error.response.data)
      console.error('Status del error:', error.response.status)
    }
    return Promise.reject(error)
  }
)

export default {
  async getAllAuthors() {
    try {
      console.log('Obteniendo todos los autores...')
      const response = await api.get('/authors')
      console.log('Respuesta completa:', response)
      console.log('Datos recibidos:', response.data)
      return response.data
    } catch (error) {
      console.error('Error al obtener autores:', error)
      throw error
    }
  },

  async getAuthorById(id) {
    try {
      console.log('Obteniendo autor por ID:', id)
      const response = await api.get(`/authors/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener autor:', error)
      throw error
    }
  },

  async createAuthor(author) {
    try {
      console.log('Creando autor:', author)
      const response = await api.post('/authors', author)
      return response.data
    } catch (error) {
      console.error('Error al crear autor:', error)
      throw error
    }
  },

  async updateAuthor(id, author) {
    try {
      console.log('Actualizando autor:', id, author)
      const response = await api.put(`/authors/${id}`, author)
      return response.data
    } catch (error) {
      console.error('Error al actualizar autor:', error)
      throw error
    }
  },

  async deleteAuthor(id) {
    try {
      console.log('Eliminando autor:', id)
      await api.delete(`/authors/${id}`)
    } catch (error) {
      console.error('Error al eliminar autor:', error)
      throw error
    }
  },

  async getAuthorsByBook(isbn) {
    try {
      console.log('Buscando autores por libro:', isbn)
      const response = await api.get(`/authors/find/${isbn}`)
      return response.data
    } catch (error) {
      console.error('Error al buscar autores por libro:', error)
      throw error
    }
  }
}
