import '../../../CSS/moleculasCSS/clientes/RiskGauge.css';

// Velocimetro reusable para visualizar score y categoria de riesgo en un rango 0-100.
function RiskGauge(props) {
  let score = props.score !== undefined ? props.score : 0;
  let scoreNormalizado = normalizarScore(score);
  let categoria = props.category !== undefined ? normalizarCategoria(props.category) : calcularCategoria(scoreNormalizado);
  let scoreVisible = formatearScore(scoreNormalizado);
  let tamanio = props.size ? props.size : 'md';
  let mostrarEtiquetas = props.showLabels !== false;
  let dimensiones = obtenerDimensiones(tamanio);
  let segmentos = obtenerSegmentos();
  let arcos = construirArcos(segmentos, dimensiones);
  let angulo = calcularAngulo(scoreNormalizado);
  let aguja = calcularPuntoAguja(dimensiones, angulo);
  let descripcionAria = props.ariaLabel
    ? props.ariaLabel
    : construirAriaLabel(scoreVisible, categoria);

  return (
    <figure className="risk-gauge" role="img" aria-label={descripcionAria}>
      <svg
        width={dimensiones.ancho}
        height={dimensiones.alto}
        viewBox={'0 0 ' + dimensiones.ancho + ' ' + dimensiones.alto}
      >
        {arcos.map(function renderArco(arco) {
          return (
            <path
              key={arco.id}
              d={arco.path}
              stroke={arco.color}
              strokeWidth={dimensiones.stroke}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
        <line
          x1={dimensiones.centroX}
          y1={dimensiones.centroY}
          x2={aguja.x}
          y2={aguja.y}
          className="risk-gauge__aguja"
        />
        <circle
          cx={dimensiones.centroX}
          cy={dimensiones.centroY}
          r={dimensiones.stroke / 2}
          className="risk-gauge__centro"
        />
      </svg>

      {mostrarEtiquetas && (
        <figcaption className="risk-gauge__labels">
          <span className="risk-gauge__score">Score: {scoreVisible} / 100</span>
          <span className="risk-gauge__categoria">
            Categoria: Riesgo {obtenerTextoCategoria(categoria)}
          </span>
        </figcaption>
      )}
    </figure>
  );
}

// Asegura que el score este dentro del rango permitido 0-100.
function normalizarScore(score) {
  let valor = Number(score);

  if (Number.isNaN(valor)) {
    valor = 0;
  }

  if (valor < 0) {
    return 0;
  }

  if (valor > 100) {
    return 100;
  }

  return valor;
}

// Formatea el score para mostrarlo en la interfaz sin perder el rango original.
function formatearScore(score) {
  return Math.round(score);
}

// Determina la categoria por rangos segun reglas de negocio definidas.
function calcularCategoria(score) {
  if (score >= 80) {
    return 1;
  }
  if (score >= 65) {
    return 2;
  }
  if (score >= 50) {
    return 3;
  }
  if (score >= 35) {
    return 4;
  }
  return 5;
}

// Asigna dimensiones visuales segun el tamano solicitado.
function obtenerDimensiones(tamanio) {
  let ancho = 220;
  let stroke = 14;

  if (tamanio === 'sm') {
    ancho = 180;
    stroke = 10;
  }

  if (tamanio === 'lg') {
    ancho = 260;
    stroke = 18;
  }

  let radio = Math.round(ancho / 2) - 20;
  let alto = Math.round(ancho / 2) + 20;
  let centroX = Math.round(ancho / 2);
  let centroY = Math.round(ancho / 2);

  return {
    ancho: ancho,
    alto: alto,
    radio: radio,
    stroke: stroke,
    centroX: centroX,
    centroY: centroY
  };
}

// Define los rangos y colores de cada segmento del velocimetro.
function obtenerSegmentos() {
  return [
    { id: 'cat5', desde: 0, hasta: 34, color: 'var(--color-peligro)' },
    { id: 'cat4', desde: 35, hasta: 49, color: 'var(--color-alerta)' },
    { id: 'cat3', desde: 50, hasta: 64, color: 'var(--color-warning)' },
    { id: 'cat2', desde: 65, hasta: 79, color: '#7bd389' },
    { id: 'cat1', desde: 80, hasta: 100, color: 'var(--color-exito)' }
  ];
}

// Convierte los rangos en paths SVG para dibujar los segmentos.
function construirArcos(segmentos, dimensiones) {
  return segmentos.map(function mapearSegmento(segmento) {
    let anguloInicio = calcularAngulo(segmento.desde);
    let anguloFin = calcularAngulo(segmento.hasta);
    let path = describirArco(
      dimensiones.centroX,
      dimensiones.centroY,
      dimensiones.radio,
      anguloInicio,
      anguloFin
    );

    return {
      id: segmento.id,
      color: segmento.color,
      path: path
    };
  });
}

// Calcula el angulo segun el score dentro de un semicirculo de 180 grados.
function calcularAngulo(score) {
  return 180 - (score / 100) * 180;
}

// Obtiene las coordenadas de la aguja segun el angulo calculado.
function calcularPuntoAguja(dimensiones, angulo) {
  let punto = convertirPolarCartesiano(
    dimensiones.centroX,
    dimensiones.centroY,
    dimensiones.radio - 6,
    angulo
  );

  return {
    x: punto.x,
    y: punto.y
  };
}

// Traduce un angulo y radio a coordenadas cartesianas para SVG.
function convertirPolarCartesiano(cx, cy, radio, anguloEnGrados) {
  let anguloEnRadianes = (Math.PI / 180) * anguloEnGrados;

  return {
    x: cx + radio * Math.cos(anguloEnRadianes),
    y: cy - radio * Math.sin(anguloEnRadianes)
  };
}

// Construye un path de arco para SVG usando coordenadas polares.
function describirArco(cx, cy, radio, anguloInicio, anguloFin) {
  let inicio = convertirPolarCartesiano(cx, cy, radio, anguloFin);
  let fin = convertirPolarCartesiano(cx, cy, radio, anguloInicio);
  let granArco = Math.abs(anguloFin - anguloInicio) <= 180 ? '0' : '1';

  return (
    'M ' +
    inicio.x +
    ' ' +
    inicio.y +
    ' A ' +
    radio +
    ' ' +
    radio +
    ' 0 ' +
    granArco +
    ' 0 ' +
    fin.x +
    ' ' +
    fin.y
  );
}

// Genera el texto accesible requerido para describir el score y la categoria.
function construirAriaLabel(score, categoria) {
  return (
    'Score ' +
    score +
    ' sobre 100, categoria ' +
    categoria +
    ', riesgo ' +
    obtenerTextoCategoria(categoria).toLowerCase()
  );
}

// Traduce la categoria numerica a un texto descriptivo.
function obtenerTextoCategoria(categoria) {
  if (categoria === 1) {
    return 'Bajo';
  }
  if (categoria === 2) {
    return 'Medio-Bajo';
  }
  if (categoria === 3) {
    return 'Medio';
  }
  if (categoria === 4) {
    return 'Alto';
  }
  return 'Critico';
}

// Normaliza la categoria para evitar valores fuera de rango.
function normalizarCategoria(categoria) {
  let valor = Number(categoria);

  if (Number.isNaN(valor) || valor < 1 || valor > 5) {
    return 5;
  }

  return valor;
}

export default RiskGauge;
