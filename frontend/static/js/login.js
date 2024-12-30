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
                
                // Guardar datos en localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user_id', data.user_id);
                localStorage.setItem('role_id', data.role_id);
                
                // Esperar un momento antes de redireccionar
                setTimeout(() => {
                    window.location.href = './PortalEBR.html';
                }, 1500);
            } else {
                const error = await response.json();
                let errorMessage = 'Error al iniciar sesión';
                
                // Mensajes personalizados según el error
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
            // Restaurar botón
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
