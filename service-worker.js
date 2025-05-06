// Escucha clicks en la notificación para, por ejemplo, abrir una URL
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlDestino = event.notification.data && event.notification.data.urlDestino;
  if (urlDestino) {
    event.waitUntil(
      clients.openWindow(urlDestino)
    );
  }
});

