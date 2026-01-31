import '../../../CSS/atomosCSS/inicio/TarjetaMetrica.css';

// Card atomica para mostrar una metrica clave del dashboard.
function TarjetaMetrica(props) {
  let tono = props.tono ? props.tono : 'neutro';
  let icono = props.icono ? props.icono : '*';

  return (
    <article className="tarjeta-metrica" data-tone={tono}>
      <header className="tarjeta-metrica__header">
        <span className="tarjeta-metrica__icono" aria-hidden="true">
          {icono}
        </span>
        <span className="tarjeta-metrica__titulo">{props.titulo}</span>
      </header>
      <strong className="tarjeta-metrica__valor">{props.valor}</strong>
      {props.detalle && <span className="tarjeta-metrica__detalle">{props.detalle}</span>}
    </article>
  );
}

export default TarjetaMetrica;
