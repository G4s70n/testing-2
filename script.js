// --- Registro del Service Worker (solo en HTTPS o localhost) ---
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('service-worker.js')
    .then(reg => console.log('SW registrado, scope:', reg.scope))
    .catch(err => console.error('Error registrando SW:', err));
} else {
  console.warn('Service Worker requiere HTTPS o localhost. No se registró.');
}

// --- Elementos del DOM ---
const requestPermissionBtn = document.getElementById('requestPermissionBtn');
const sendInputBtn         = document.getElementById('sendInputBtn');
const fetchAndNotifyBtn    = document.getElementById('fetchAndNotifyBtn');
const numberInput          = document.getElementById('numberInput');

// --- 1) Solicitar permiso de notificaciones ---
requestPermissionBtn.addEventListener('click', async () => {
  const result = await Notification.requestPermission();
  console.log('Permiso de notificaciones:', result);
});

// --- 2) Función reutilizable para enviar notificación push ---
async function sendPushNotification(number) {
  if (Notification.permission !== 'granted') {
    console.warn('Permiso de notificaciones no concedido');
    return;
  }

  const notificationOptions = {
    body: `Toca "Sí" en la notificación y luego marca ${number}`,
    icon: './assets/logo.png',
    tag: 'mi-app-codigo-verificacion',
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200],
    data: {
      numero: number,
      urlDestino: '/confirmar-accion?codigo=' + number,
      tipoNotificacion: 'verificacion-2fa'
    },
    timestamp: Date.now(),
    renotify: false
  };

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification('Código de verificación', notificationOptions);
    console.log('Notificación mostrada con el número', number);
  } catch (err) {
    console.error('Error mostrando notificación:', err);
  }
}

// --- 3) Enviar notificación con el número del input ---
sendInputBtn.addEventListener('click', () => {
  const num = parseInt(numberInput.value, 10);
  if (isNaN(num)) {
    alert('Por favor ingresa un número válido.');
    return;
  }
  sendPushNotification(num);
});

// --- 4) Simular llamada a API con setTimeout ---
function simulateApiCall() {
  return new Promise((resolve) => {
    // Simulamos 2 segundos de retraso como si fuera una llamada real
    setTimeout(() => {
      // Generamos un número aleatorio de dos dígitos
      const randomNum = Math.floor(Math.random() * 90) + 10;
      resolve(randomNum);
    }, 2000);
  });
}

fetchAndNotifyBtn.addEventListener('click', async () => {
  try {
    console.log('Simulando llamada a API...');
    const randomNum = await simulateApiCall();
    console.log('Número recibido de la "API":', randomNum);
    sendPushNotification(randomNum);
  } catch (err) {
    console.error('Error en la simulación de API:', err);
    alert('Ocurrió un error al simular la llamada a la API.');
  }
});

