import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/app-customers'

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
    console.log('Realizando petición a Customers:', config.method.toUpperCase(), config.url)
    console.log('URL completa:', config.baseURL + config.url)
    return config
  },
  error => {
    console.error('Error en petición a Customers:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    console.log('Respuesta recibida de Customers:', response.status, response.data)
    return response
  },
  error => {
    console.error('Error en respuesta de Customers:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

class CustomerService {
  // Obtener todos los customers
  async getAllCustomers() {
    try {
      const response = await api.get('/customers')
      return response.data
    } catch (error) {
      console.error('Error al obtener customers:', error)
      throw this.handleError(error)
    }
  }

  // Obtener customer por ID
  async getCustomerById(id) {
    try {
      const response = await api.get(`/customers/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener customer ${id}:`, error)
      throw this.handleError(error)
    }
  }

  // Crear customer
  async createCustomer(customer) {
    try {
      const customerData = {
        name: customer.name,
        email: customer.email
      }
      
      console.log('Enviando datos de customer:', customerData)
      const response = await api.post('/customers', customerData)
      return response.data
    } catch (error) {
      console.error('Error al crear customer:', error)
      throw this.handleError(error)
    }
  }

  // Actualizar customer
  async updateCustomer(id, customer) {
    try {
      const customerData = {
        id: id,
        name: customer.name,
        email: customer.email,
        version: customer.version
      }
      
      console.log('Actualizando customer:', customerData)
      const response = await api.put(`/customers/${id}`, customerData)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar customer ${id}:`, error)
      throw this.handleError(error)
    }
  }

  // Eliminar customer
async deleteCustomer(id) {
  try {
    console.log(`Eliminando customer ${id}`);
    await api.delete(`/customers/${id}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar customer ${id}:`, error);

    if (error.response && error.response.status === 400) {
      // Mensaje personalizado para el error 400
      throw new Error(error.response.data || 'No se puede eliminar el cliente porque tiene datos relacionados.');
    }

    throw this.handleError(error);
  }
}


  // Manejo de errores
  handleError(error) {
    if (error.response) {
      // El servidor respondió con un código de estado que no está en el rango 2xx
      const message = error.response.data?.message || `Error del servidor: ${error.response.status}`
      return new Error(message)
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      return new Error('No se pudo conectar con el servidor de customers. Verifique que esté ejecutándose en http://localhost:7070')
    } else {
      // Algo sucedió al configurar la petición
      return new Error(`Error de configuración: ${error.message}`)
    }
  }

  // Validar datos de customer
  validateCustomer(customer) {
    const errors = []
    
    if (!customer.name || customer.name.trim() === '') {
      errors.push('El nombre es requerido')
    }
    
    if (!customer.email || customer.email.trim() === '') {
      errors.push('El email es requerido')
    } else if (!this.isValidEmail(customer.email)) {
      errors.push('El email no tiene un formato válido')
    }
    
    return errors
  }

  // Validar formato de email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

export default new CustomerService()
