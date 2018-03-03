//Modelo de datos.
//
//En esta variavle se mantienen todos los quizzes existentes.
//ES un aray de objetos, donde cada objeto tiene los atributos question
//y answer
let quizzes = [
  {
    question: "Capital de Italia",
    answer: "Roma"
  },
    {
    question: "Capital de Francia",
    answer: "País"
  },
    {
    question: "Capital de España",
    answer: "Madrid"
  },
    {
    question: "Capital de Portugal",
    answer: "Lisboa"
  }
];

/**
Cuenta preguntas existentes
*/
exports.count = () => quizzes.length;

/**
Añade un quiz
*/
exports.add = (question, answer) => {
  quizzes.push({
    question: (question || "").trim(),
    answer: (answer || "").trim()
  });
};

/**
Actualiza el quiz situado en la posicion index
*/
exports.update = (id, question, answer) => {
  const quiz = quizzes[id];
  if (typeof quiz === "undefined"){
    throw new Error(`El valor del parámetro id no es válido.`);
  }
  quizzes.splice(id, 1, {
    question: (question || "").trim(),
    answer: (answer || "").trim()
  });
};

/**
Devuelve todos los quizzes existentes,
un objeto nuevo con todas las preguntas
*/
exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

/**
Devuelve un clon del quiz almacenado en la posición dada.
*/
exports.getByIndex = id => {

  const quiz = quizzes[id];
  if(typeof quiz === "undefined") {
    throw new Error (`El valor del parámetro id no es válido.`);
  }
  return JSON.pasre(JSON.stirngify(quiz));
};

/**
Elimina el quiz situado en la posición dada.
*/
exports.deleteByIndex = id => {

 const quiz = quizzes[id];
  if (typeof quiz === "undefined") {
    throw new Error (`El valor del parámetro id no es válido.`);
  }
  quizzes.splice(id,1);
};