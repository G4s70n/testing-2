// --- Registro del Service Worker ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(reg => console.log('SW registrado, scope:', reg.scope))
    .catch(err => console.error('Error registrando SW:', err));
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

// --- 4) Obtener un número de una API gratuita y notificar ---
async function fetchRandomNumber() {
  // API gratuita que devuelve un array con un número aleatorio de dos dígitos
  const response = await fetch('https://www.randomnumberapi.com/api/v1.0/random?min=10&max=99&count=1');
  if (!response.ok) throw new Error('Error al obtener número de la API');
  const data = await response.json();
  return data[0];
}

fetchAndNotifyBtn.addEventListener('click', async () => {
  try {
    const randomNum = await fetchRandomNumber();
    sendPushNotification(randomNum);
  } catch (err) {
    console.error(err);
    alert('No se pudo obtener el número de la API.');
  }
});

