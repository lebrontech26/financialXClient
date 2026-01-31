import '../../../CSS/moleculasCSS/clientes/BadgeCategoria.css';

// Etiqueta visual de categoria con un punto de color y texto descriptivo.
function BadgeCategoria(props) {
  let categoria = props.categoria !== undefined ? normalizarCategoria(props.categoria) : 5;
  let texto = obtenerTextoCategoria(categoria);
  let clase = 'badge-categoria badge-categoria--' + categoria;

  return (
    <span className={clase}>
      <span className="badge-categoria__punto"></span>
      {texto}
    </span>
  );
}

// Convierte la categoria numerica en una etiqueta visible para la tabla.
function obtenerTextoCategoria(categoria) {
  let valor = normalizarCategoria(categoria);

  if (valor === 1) {
    return 'Bajo';
  }
  if (valor === 2) {
    return 'Medio-Bajo';
  }
  if (valor === 3) {
    return 'Medio';
  }
  if (valor === 4) {
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

export default BadgeCategoria;
