import React, { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaginaListaClientes from '../JSX/paginasJSX/clientes/PaginaListaClientes.jsx';
import PaginaCrearCliente from '../JSX/paginasJSX/clientes/PaginaCrearCliente.jsx';
import {
  resetClientesMock,
  obtenerClientesMock,
  obtenerClienteMock,
  crearClienteMock,
  actualizarClienteMock,
  eliminarClienteMock
} from '../datos/clientesMock.js';

vi.mock('../servicios/clientsApi.js', function () {
  return {
    obtenerClientes: obtenerClientesMock,
    obtenerClientePorId: obtenerClienteMock,
    crearCliente: crearClienteMock,
    actualizarCliente: actualizarClienteMock,
    eliminarCliente: eliminarClienteMock
  };
});

describe('Modulo Clientes UI', function () {
  beforeEach(function () {
    if (typeof globalThis !== 'undefined') {
      globalThis.__VITE_USAR_MOCKS__ = true;
      globalThis.__MOCK_DELAY_MS__ = 0;
    }
    resetClientesMock();
    vi.useRealTimers();
  });

  afterEach(function () {
    vi.useRealTimers();
  });

  it('muestra el loading en el listado', async function () {
    if (typeof globalThis !== 'undefined') {
      globalThis.__MOCK_DELAY_MS__ = 300;
    }

    render(<PaginaListaClientes />);

    expect(screen.getByText('Cargando clientes...')).toBeInTheDocument();

    await screen.findByText('Juan');
  });

  it('aplica debounce en el buscador', async function () {
    vi.useFakeTimers();

    if (typeof globalThis !== 'undefined') {
      globalThis.__MOCK_DELAY_MS__ = 0;
    }

    render(<PaginaListaClientes />);

    await act(async function () {
      await vi.runAllTimersAsync();
    });
    expect(screen.getByText('Juan')).toBeInTheDocument();

    let input = screen.getByLabelText('Buscar');

    fireEvent.change(input, { target: { value: 'Ana' } });

    act(function () {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByText('Juan')).toBeInTheDocument();

    await act(async function () {
      vi.advanceTimersByTime(200);
    });

    await act(async function () {
      await vi.runAllTimersAsync();
    });

    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.queryByText('Juan')).not.toBeInTheDocument();
  });

  it('valida el formulario de alta', async function () {
    let usuario = userEvent.setup();

    render(<PaginaCrearCliente />);

    let botonGuardar = screen.getByRole('button', { name: 'Guardar' });
    expect(botonGuardar).toBeDisabled();

    let inputCuil = screen.getByLabelText('CUIL');
    await usuario.type(inputCuil, '123');

    expect(
      screen.getByText('El CUIL debe tener 11 digitos numericos.')
    ).toBeInTheDocument();
  });

  it('elimina un cliente con confirmacion', async function () {
    let usuario = userEvent.setup();

    render(<PaginaListaClientes />);

    await screen.findByText('Juan');

    let botonesEliminar = screen.getAllByRole('button', { name: 'Eliminar' });
    await usuario.click(botonesEliminar[0]);

    let dialogo = screen.getByRole('dialog');
    let botonConfirmar = within(dialogo).getByRole('button', { name: 'Eliminar' });

    await usuario.click(botonConfirmar);

    await waitFor(function () {
      expect(screen.queryByText('Juan')).not.toBeInTheDocument();
    });
  });
});
