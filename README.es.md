# Calculadora de Punto de Venta

Este proyecto es una aplicación web de una sola página que funciona como una calculadora de estilo Punto de Venta (POS). Está diseñada para pequeñas empresas que necesitan calcular rápidamente los totales de los artículos con precios en dos monedas diferentes: dólares estadounidenses (USD) y bolívares venezolanos (Bs.).

La aplicación está construida con HTML, CSS y JavaScript vanilla, sin frameworks o librerías externas. Es una aplicación de sólo cliente que utiliza el `localStorage` del navegador para la persistencia de los datos.

**Características principales:**
- **Entrada de doble moneda:** Secciones separadas para añadir partidas con precio en USD y Bs.
- **Cálculo en tiempo real:** Todos los totales y subtotales se actualizan automáticamente a medida que se cambian los valores.
- **Tasa de cambio manual:** Una entrada dedicada para que el usuario establezca la tasa de cambio de USD a Bs.
- **Filas dinámicas:** Los usuarios pueden añadir y eliminar un número ilimitado de partidas para cada moneda.
- **Gestión de sesiones:** Los usuarios pueden guardar el estado actual de un cálculo, ver una lista de los cálculos guardados y cargarlos o eliminarlos. Esto incluye una función de "autoguardado al reiniciar".
- **Tema oscuro/claro:** Un conmutador de temas permite a los usuarios alternar entre un modo claro y oscuro.
- **Aplicación web progresiva (PWA):** La aplicación incluye un service worker y un manifiesto web, lo que permite "instalarla" en un dispositivo de sobremesa o móvil y que funcione sin conexión.
- **Despliegue continuo:** El proyecto está configurado con un flujo de trabajo de GitHub Actions para desplegarse automáticamente en GitHub Pages cuando se suben cambios a la rama `main`.

## Construcción y ejecución

Este es un proyecto web estático y no tiene un paso de construcción complejo.

### Ejecución local

Para ejecutar la aplicación localmente, debe servir los archivos desde un servidor web local. Las características de la PWA (como el service worker) no funcionarán correctamente si abre el archivo `index.html` directamente desde el sistema de archivos (`file:///...`).

1.  Navegue hasta el directorio raíz del proyecto en su terminal.
2.  Ejecute un servidor HTTP simple. El método recomendado es usar Python:
    ```bash
    python -m http.server
    ```
3.  Abra su navegador web y vaya a `http://localhost:8000`.

### Despliegue

El proyecto está configurado para el despliegue continuo en GitHub Pages.

- **Disparador:** Un `push` a la rama `main` disparará automáticamente el flujo de trabajo de despliegue.
- **Archivo de flujo de trabajo:** La lógica de despliegue se define en `.github/workflows/deploy.yml`.
- **Fuente:** El sitio de GitHub Pages está configurado para ser desplegado usando "GitHub Actions".

## Licencia

Este proyecto está licenciado bajo la Licencia Internacional Creative Commons Atribución-NoComercial 4.0. Vea los archivos [LICENSE](LICENSE) y [LICENSE.es](LICENSE.es) para más detalles.
