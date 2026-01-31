// Formatea fechas para presentar en la UI de manera simple.
function formatearFechaSimple(valor) {
  if (!valor) {
    return '-';
  }

  let fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return valor;
  }

  let dia = String(fecha.getDate()).padStart(2, '0');
  let mes = String(fecha.getMonth() + 1).padStart(2, '0');
  let anio = fecha.getFullYear();

  return dia + '/' + mes + '/' + anio;
}

// Construye el texto de domicilio evitando valores vacios o indefinidos.
function construirDireccion(direccion, cliente) {
  let calle = direccion && direccion.street ? direccion.street : cliente.street;
  let localidad = direccion && direccion.locality ? direccion.locality : cliente.locality;
  let provincia = direccion && direccion.province ? direccion.province : cliente.province;

  if (!calle && !localidad && !provincia) {
    return '-';
  }

  return (
    (calle ? calle : '-') +
    ', ' +
    (localidad ? localidad : '-') +
    ', ' +
    (provincia ? provincia : '-')
  );
}

// Asegura que los textos no queden vacios en pantalla.
function obtenerTextoSeguro(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return '-';
  }

  return String(valor);
}

// Formatea numeros con separador de miles para mejorar la lectura.
function formatearNumero(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return '-';
  }

  let numero = Number(valor);
  if (Number.isNaN(numero)) {
    return String(valor);
  }

  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numero);
}

// Remueve separadores y deja solo digitos para inputs numericos.
function limpiarNumeroEntrada(valor) {
  if (valor === null || valor === undefined) {
    return '';
  }

  return String(valor).replace(/[^0-9]/g, '');
}

// Formatea un input numerico agregando separadores de miles.
function formatearNumeroEntrada(valor) {
  let limpio = limpiarNumeroEntrada(valor);

  if (!limpio) {
    return '';
  }

  return formatearNumero(Number(limpio));
}

// Convierte un input formateado a numero para calculos.
function obtenerNumeroDesdeEntrada(valor) {
  let limpio = limpiarNumeroEntrada(valor);

  if (!limpio) {
    return NaN;
  }

  return Number(limpio);
}

function generarFranjasHorariasMediaHora() {
  let opciones = [];

  for (let minutos = 0; minutos < 1440; minutos += 30) {
    let inicio = formatearHora(minutos);
    let fin = formatearHora((minutos + 30) % 1440);
    let etiqueta = inicio + '-' + fin;

    opciones.push({
      valor: etiqueta,
      etiqueta: etiqueta
    });
  }

  return opciones;
}

function formatearHora(minutosTotales) {
  let horas = Math.floor(minutosTotales / 60) % 24;
  let minutos = minutosTotales % 60;

  return String(horas).padStart(2, '0') + ':' + String(minutos).padStart(2, '0');
}

export {
  formatearFechaSimple,
  construirDireccion,
  obtenerTextoSeguro,
  formatearNumero,
  limpiarNumeroEntrada,
  formatearNumeroEntrada,
  obtenerNumeroDesdeEntrada,
  generarFranjasHorariasMediaHora
};
