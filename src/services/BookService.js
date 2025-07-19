import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/app-books'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 60000
})

// Interceptor para logging
api.interceptors.request.use(
  config => {
    console.log('Realizando petición a Books:', config.method.toUpperCase(), config.url)
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
    console.log('Respuesta recibida de Books:', response.status, response.data)
    return response
  },
  error => {
    console.error('Error en respuesta de Books:', error.message)
    if (error.response) {
      console.error('Datos del error:', error.response.data)
      console.error('Status del error:', error.response.status)
    }
    return Promise.reject(error)
  }
)

export default {
  async getAllBooks() {
    try {
      console.log('Obteniendo todos los libros...')
      const response = await api.get('/books')
      console.log('Respuesta completa:', response)
      console.log('Datos recibidos:', response.data)
      return response.data
    } catch (error) {
      console.error('Error al obtener libros:', error)
      throw error
    }
  },

  async getBookByIsbn(isbn) {
    try {
      console.log('Obteniendo libro por ISBN:', isbn)
      const response = await api.get(`/books/${isbn}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener libro:', error)
      throw error
    }
  },

  async createBook(book) {
    try {
      console.log('Creando libro:', book)
      const response = await api.post('/books', book)
      return response.data
    } catch (error) {
      console.error('Error al crear libro:', error)
      throw error
    }
  },

  async updateBook(isbn, book) {
    try {
      console.log('Actualizando libro:', isbn, book)
      const response = await api.put(`/books/${isbn}`, book)
      return response.data
    } catch (error) {
      console.error('Error al actualizar libro:', error)
      throw error
    }
  },

  async deleteBook(isbn) {
  try {
    console.log('Eliminando libro:', isbn);
    await api.delete(`/books/${isbn}`);
  } catch (error) {
    console.error('Advertencia:', error);
    if (error.response && error.response.status === 400) {
      throw new Error(error.response.data || 'No se puede eliminar el libro porque tiene datos relacionados.');
    }
    throw error; 
  }
}
}
