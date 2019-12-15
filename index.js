const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const drawN = 1000;
const table = document.getElementById('table');
const halfWidth = canvas.width / 2;
const halfHeight = canvas.height / 2;
let Step = 20;
const K = 3;

function drawField () {
  // --------------------draw field---------------------------
  ctx.strokeStyle = 'silver';
  for (let i = 0; i < canvas.width; i += 25) {
    for (let j = 0; j < canvas.height; j += 25) {
      ctx.strokeRect(i, j, 25, 25);
    }
  }

  for (let i = -canvas.width; i < canvas.width; i += 50) {

    ctx.fillText(i, halfWidth + i, halfHeight);
    ctx.fillText(-i, halfWidth, halfHeight + i);
  }

  // for (let i = -5; i <= 5; i++) {
  //   ctx.fillText(i, halfWidth + i * 100, halfHeight);
  //   ctx.fillText(i * 0.1, halfWidth, halfHeight + i * 100);
  // }

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(halfWidth, 0);
  ctx.lineTo(halfWidth, canvas.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, halfHeight);
  ctx.lineTo(canvas.width, halfHeight);
  ctx.stroke();
}
window.onload = () => {
  drawField();
};

// eslint-disable-next-line no-unused-vars
function reset () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawField();
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
}

function sourceFunction (x, draw = 0) {
  const y = -(Math.log(x) * 10 - (x * x * x + 200) / 20 + x * x + 50);

  return y;
}

function createMatrix (k, n, x) {
  const matrix = [];
  for (let i = 0; i < k + 1; i++) {
    matrix[i] = [];
    for (let j = 0; j < k + 1; j++) {
      matrix[i][j] = 0;
      for (let z = 0; z < n; z++) {
        matrix[i][j] += Math.pow(x[z], i + j);
      }
    }
  }
  return matrix;
}

function createMatrixB (k, n, x) {
  const matrixB = [];
  for (let i = 0; i < k + 1; i++) {
    matrixB[i] = 0;
    for (let z = 0; z < n; z++) {
      matrixB[i] += Math.pow(x[z], i) * sourceFunction(x[z]);
    }
  }
  return matrixB;
}

function createXarray (n) {
  const x = [];
  const max = 1000;
  const min = 0;
  for (let i = 0; i < n; i++) {
    x[i] = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return x;
}

function checkZeroInMatrix (matrix, matrixB) {
  for (let i = 0; i < K + 1; i++) {
    if (matrix[i][i] === 0) {
      for (let j = 0; j < K + 1; j++) {
        if (matrix[j][i] !== 0 && matrix[i][j] !== 0) {
          for (let z = 0; z < K + 1; z++) {
            const tmp = matrix[i][z];
            matrix[i][z] = matrix[j][z];
            matrix[j][z] = tmp;
          }
          const tmp = matrixB[i];
          matrixB[i] = matrixB[j];
          matrixB[j] = tmp;
        }
      }
    }
  }
}

function resolveSystemViaGaussMethod (matrix, matrixB, result) {
  for (let k = 0; k < K + 1; k++) {
    for (let i = k + 1; i < K + 1; i++) {
      if (matrix[k][k] === 0) {
        console.log('Solution is not exist');
        return result;
      }
      const M = matrix[i][k] / matrix[k][k];
      for (let j = k; j < K + 1; j++) {
        matrix[i][j] -= M * matrix[k][j];
      }
      matrixB[i] -= M * matrixB[k];
    }
  }

  for (let i = (K + 1) - 1; i >= 0; i--) {

    let s = 0;
    for (let j = i; j < K + 1; j++) {

      s = s + matrix[i][j] * result[j];
    }
    result[i] = (matrixB[i] - s) / matrix[i][i];
  }
}

function sourceFromMKN (result, x) {
  let y = 0;
  for (let i = 0; i < K + 1; i++) {
    y += result[i] * Math.pow(x, i);
  }
  return y;
}

function initRezult (result) {
  for (let i = 0; i < K + 1; i++) {

    result[i] = 0;
  }
  return result;
}
// eslint-disable-next-line no-unused-vars
function drawMKN () {
  reset();
  const input = document.getElementById('input');

  Step = parseInt(input.value);
  const n = Step || 10;
  console.log(n);
  const x = createXarray(n);
  const matrix = createMatrix(K, n, x);
  const matrixB = createMatrixB(K, n, x);

  checkZeroInMatrix(matrix, matrixB);

  const result = [];
  initRezult(result);
  resolveSystemViaGaussMethod(matrix, matrixB, result);

  console.log('y = ');
  for (let i = 0; i < K + 1; i++) {
    console.log('x^' + i + ' * ' + ' ' + result[i].toFixed(2));
  }

  // ----------------------MKN------------------------------
  const cx = halfWidth;
  const cy = halfHeight;
  // - to =
  ctx.strokeStyle = 'red';

  ctx.moveTo(cx, cy);

  ctx.beginPath();
  for (let i = -drawN; i < drawN; i++) {
    const x = i;
    const y = sourceFromMKN(result, x);

    ctx.lineTo(cx + x, cy + y);
  }
  ctx.stroke();

  // ----------------------source-function------------------------------

  ctx.strokeStyle = 'blue';

  ctx.moveTo(cx, cy);
  ctx.beginPath();
  ctx.lineWidth = 2.5;

  for (let i = -drawN; i < drawN; i++) {
    const x = i;
    const y = sourceFunction(x);
    ctx.lineTo(cx + x, cy + y);
  }
  ctx.stroke();

  const checkbox = document.getElementById('checkbox');
  if (checkbox.checked) {
    findDifferences(result);
  }
}

function findDifferences (result) {
  const cx = halfWidth;
  const cy = halfHeight;
  let maxDiff = -100000000000;
  let maxDiffX = 0;
  for (let i = -drawN; i < drawN; i++) {
    const x = i;
    const y1 = sourceFunction(x);
    const y2 = sourceFromMKN(result, x);
    ctx.beginPath();
    if (y1 && y2 && y1 !== Infinity) {
      if (Math.abs(y1 - y2) > maxDiff) {
        maxDiff = Math.abs(y1 - y2);
        maxDiffX = i;
      }
      ctx.moveTo(cx + x, cy + y1);
      ctx.lineTo(cx + x, cy + y2);
      ctx.strokeStyle = 'black';
      ctx.stroke();
    }
  }
  const div = document.createElement('div');
  div.textContent = `MAX deviation = ${(maxDiff).toFixed(2)} ( x = ${maxDiffX} )`;
  table.appendChild(div);
}
