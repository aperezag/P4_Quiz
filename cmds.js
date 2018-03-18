
const Sequelize = require('sequelize');
const {models} = require('./model');

const {log, biglog, errorlog, colorize} = require("./out");

exports.helpCMD = rl =>{
	  log("Comandos:");
      log("		h|help - Muestra esta ayuda.");
      log("		list - Listar los quizzes existentes.");
      log("		show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
      log("		add - Añadir un nuevo quiz interactivamente.");
      log("		delete <id> - Borrar el quiz indicado.");
      log("		edit <id> - Editar el quiz indicado.");
      log("		test <id> - Probar el quiz indicado.");
      log("		p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
      log("		credits - Créditos.");
      log("		q|quit - Salir del programa.");
      rl.prompt();
}

exports.listCMD = rl =>{

    models.quiz.findAll()
        .each(quiz => {
            log(` [${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`);
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
		});
};


exports.quitCMD = rl =>{
	rl.close();
};


const makeQuestion = (rl, text) => {
	return new Promise((resolve, reject) => {
		rl.question(colorize(text, 'red'), answer => {
			resolve(answer.trim());
		});
	});
};

exports.addCMD = rl =>{
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
            log(` ${colorize('Se ha añadido','magenta')}: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
		});
};

exports.editCMD = (rl,id)  =>{
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
            log(`Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        })

        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })

        .catch(error => {
            errorlog(error.message);
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

exports.showCMD = (rl, id)  =>{
	
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if(!quiz){
			throw new Error (`Ǹo existe un quiz asociado al id=${id}.`);
		}
		log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.testCMD = (rl,id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }

            return makeQuestion(rl,  ` ${quiz.question}? `)
                .then(a => {
                    if(quiz.answer.toUpperCase() === a.toUpperCase().trim()){
                        log("Su respuesta es correcta.");
                        biglog('Correcta', 'green');
                    } else{
                        log("Su respuesta es incorrecta.");
                        biglog('Incorrecta', 'red');
                    }
                });
        })

        .catch(error => {
            errorlog(error.message);
        })

        .then(() => {
            rl.prompt();

        });

};

exports.playCMD = rl => {
    let score = 0;
    let toBeResolved = [];

    const playOne = () => {
        return new Promise((resolve,reject) => {

            if(toBeResolved.length <=0){
                console.log("No hay nada mas que preguntar.");
                console.log("Fin del juego. Aciertos:" ,score);
                resolve();
                return;
            }
            let pos = Math.floor(Math.random()*toBeResolved.length);
            let quiz = toBeResolved[pos];
            toBeResolved.splice(pos,1);

            makeQuestion(rl, quiz.question+'? ')
                .then(answer => {
                    if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
                        score++;
                        console.log("CORRECTO - Lleva ",score, "aciertos.");
                        resolve(playOne());
                    } else {
                        console.log("INCORRECTO.");
                        console.log("Fin del juego. Aciertos:",score);
                        resolve();
                    }
                })
        })
    }

    models.quiz.findAll({raw: true})
        .then(quizzes => {
            toBeResolved = quizzes;
        })
        .then(() => {
            return playOne();
        })
        .catch(error => {
            console.log(error);
        })

        .then(() => {
            biglog(score,'magenta');
            rl.prompt();

        });
};
exports.deleteCMD = (rl, id)  =>{
	
	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.creditsCMD = rl =>{
	log('Autores de la práctica');
    log('Alejandro Pérez', 'green');
    rl.prompt();
};