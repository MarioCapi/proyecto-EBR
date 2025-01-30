document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('.login-btn');
        const originalBtnText = submitBtn.innerHTML;
        
        // Mostrar loader
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loader"></span>';

        const email = document.getElementById('email').value;
        const password = passwordInput.value;

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (response.ok) {
                const data = await response.json();
                // Mostrar mensaje de éxito
                showNotification('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
                
                // Guardar token y datos del usuario en sessionStorage 
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('userData', JSON.stringify(data.user_data));
                
                // También guardar datos individuales para fácil acceso si los necesitas
                const userData = data.user_data;
                sessionStorage.setItem('user_id', userData.user_id);
                sessionStorage.setItem('role_id', userData.role_id);
                sessionStorage.setItem('email', userData.email);
                sessionStorage.setItem('company_id', userData.company_id);
                sessionStorage.setItem('company_name', userData.company_name);
                //sessionStorage.setItem('subscription_type', userData.subscription_type);
                sessionStorage.setItem('subscription_id', userData.subscription_id);
                sessionStorage.setItem('tax_id', userData.tax_id);
                sessionStorage.setItem('created_at', userData.created_at);

                
                // Verificar la sesión antes de redireccionar
                const token = sessionStorage.getItem('token');
                if (token) {
                    setTimeout(() => {
                        window.location.href = '/frontend/PortalEBR.html';
                    }, 1500);
                } else {
                    showNotification('Error al guardar la sesión', 'error');
                }
            } else {
                const error = await response.json();
                let errorMessage = 'Error al iniciar sesión';
                
                switch(error.detail) {
                    case 'Credenciales inválidas':
                        errorMessage = 'El correo o la contraseña son incorrectos';
                        break;
                    case 'Usuario no encontrado':
                        errorMessage = 'No existe una cuenta con este correo';
                        break;
                    default:
                        errorMessage = error.detail || errorMessage;
                }
                
                showNotification(errorMessage, 'error');
            }
        } catch (error) {
            showNotification('No se pudo conectar con el servidor. Por favor, intenta más tarde.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    // Error handling
    function showError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'var(--error-color)';
        errorDiv.style.fontSize = '14px';
        errorDiv.style.marginTop = '-15px';
        errorDiv.style.marginBottom = '15px';
        errorDiv.textContent = message;

        const submitButton = document.querySelector('.login-btn');
        submitButton.parentNode.insertBefore(errorDiv, submitButton);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Add input animations
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });

    function showNotification(message, type = 'error') {
        // Remover notificación existente
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Icono según el tipo
        const icon = type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span class="notification-message">${message}</span>
            <i class="fas fa-times notification-close"></i>
        `;

        document.body.appendChild(notification);

        // Manejar cierre
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        });

        // Auto cerrar después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
});

const AuthUtils = {
    // Verificar si hay una sesión activa
    checkSession: () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            window.location.href = './login.html';
            return false;
        }
        return true;
    },

    // Obtener datos del usuario
    getUserData: () => {
        const userData = sessionStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    },

    // Obtener token
    getToken: () => {
        return sessionStorage.getItem('token');
    },

    // Cerrar sesión
    logout: () => {
        sessionStorage.clear();
        window.location.href = './login.html';
    },

    // Verificar rol de usuario
    hasRole: (allowedRoles) => {
        const roleId = sessionStorage.getItem('role_id');
        return allowedRoles.includes(parseInt(roleId));
    },

    // Obtener headers para peticiones autenticadas
    getAuthHeaders: () => {
        const token = sessionStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }
};