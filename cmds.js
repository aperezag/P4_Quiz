
const Sequelize = require('sequelize');
const {models} = require('./model');

const {log, biglog, errorlog, colorize} = require("./out");

exports.helpCMD = (socket, rl) =>{
	  log(socket,"Comandos:");
      log(socket,"		h|help - Muestra esta ayuda.");
      log(socket,"		list - Listar los quizzes existentes.");
      log(socket,"		show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
      log(socket,"		add - Añadir un nuevo quiz interactivamente.");
      log(socket,"		delete <id> - Borrar el quiz indicado.");
      log(socket,"		edit <id> - Editar el quiz indicado.");
      log(socket,"		test <id> - Probar el quiz indicado.");
      log(socket,"		p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
      log(socket,"		credits - Créditos.");
      log(socket,"		q|quit - Salir del programa.");
      rl.prompt();
}

exports.listCMD = (socket,rl) =>{

    models.quiz.findAll()
        .each(quiz => {
            log(socket,` [${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`);
        })
        .catch(error => {
            errorlog(socket,error.message);
        })
        .then(() => {
            rl.prompt();
		});
};


exports.quitCMD = (socket,rl) =>{
	rl.close();
    socket.end();
};


const makeQuestion = (rl, text) => {
	return new Promise((resolve, reject) => {
		rl.question(colorize(text, 'red'), answer => {
			resolve(answer.trim());
		});
	});
};

exports.addCMD = (socket,rl) =>{
	   makeQuestion(rl, 'Introduzca una pregunta: ')
        .then(q => {
            return makeQuestion(rl, 'Introduzca la respuesta ')
                .then(a => {
                    return {question: q, answer: a};
                });
        })
        .then(quiz => {
            return models.quiz.create(quiz);
        })
        .then((quiz) => {
            log(socket,` ${colorize('Se ha añadido','magenta')}: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog(socket,'El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(socket,message));
        })
        .catch(error => {
            errorlog(socket,error.message);
        })
        .then(() => {
            rl.prompt();
		});
};

exports.editCMD = (socket,rl,id)  =>{
	    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if(!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

            return makeQuestion(rl, ' Introduzca la pregunta: ')
                .then(q => {
                    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
                    return makeQuestion(rl, ' Introduzca la respuesta ')
                        .then(a => {
                            quiz.question = q;
                            quiz.answer = a;
                            return quiz;
                        });
                });
        })

        .then(quiz => {
            return quiz.save();
        })

        .then(quiz => {
            log(socket,`Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        })

        .catch(Sequelize.ValidationError, error => {
            errorlog(socket,'El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })

        .catch(error => {
            errorlog(socket,error.message);
        })

        .then(() => {
            rl.prompt();
});
};
	

const validateId = id => {

    return new Sequelize.Promise((resolve,reject) => {
        if (typeof id === "undefined") {
            reject(new Error(`Falta el parametro <id>.`));
        } else {
            id = parseInt(id);
            if (Number.isNaN(id)) {
                reject( new Error(`El valor del parametro <id< no es un numero`));
            } else {
                resolve(id);
            }
        }
    });
};

exports.showCMD = (socket,rl, id)  =>{
	
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if(!quiz){
			throw new Error (`Ǹo existe un quiz asociado al id=${id}.`);
		}
		log(socket,` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	})
	.catch(error => {
		errorlog(socket,error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.testCMD = (socket,rl,id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }

            return makeQuestion(rl,  ` ${quiz.question}? `)
                .then(a => {
                    if(quiz.answer.toUpperCase() === a.toUpperCase().trim()){
                        log(socket,"Su respuesta es :");
                        biglog(socket,'Correcta', 'green');
                    } else{
                        log(socket,"Su respuesta es :");
                        biglog(socket,'Incorrecta', 'red');
                    }
                });
        })

        .catch(error => {
            errorlog(socket,error.message);
        })

        .then(() => {
            rl.prompt();

        });

};

exports.playCMD = (socket,rl) => {
    let score = 0;
    let toBeResolved = [];

  const playOne = () => {
    return new Promise((resolve, reject) => {
      if (toBeResolved.length <= 0) {
        log(socket, 'No hay nada más que preguntar');
        resolve();
        return;
      }

      let id = Math.floor((Math.random() * toBeResolved.length));
      let quiz = toBeResolved[id];
      toBeResolved.splice(id, 1);

      return makeQuestion(rl, `${quiz.question}?`)
      .then(answer => {
        if (answer.toLowerCase() === quiz.answer.toLowerCase().trim()) {
          score++;
          biglog(socket,'Correcto', 'green');
          resolve(playOne());
        } else {
          biglog(socket, 'Incorrecto', 'red');
          resolve();
        }
      });
    });
};
    models.quiz.findAll({raw: true})
        .then(quizzes => {
            toBeResolved = quizzes;
        })
        .then(() => {
            return playOne(socket);
        })
        .catch(error => {
            log(socket,error);
        })

        .then(() => {
            fin(socket,score);
            rl.prompt();

        });
};
exports.deleteCMD = (socket,rl, id)  =>{
	
	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error => {
		errorlog(socket,error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

const fin = (socket, score) => {
    log(socket, `Fin del juego. Aciertos:`);
    biglog(socket, score, 'magenta');
};

exports.creditsCMD = (socket,rl) =>{
	log(socket,'Autores de la práctica');
    log(socket,'Alejandro Pérez', 'green');
    rl.prompt();
};