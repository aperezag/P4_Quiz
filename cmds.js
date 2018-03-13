const {model} = require('./model');

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

	model.quiz.findAll()
	.then(quizzes=> {
		quizzes.forEach((quiz)=> {
			log(` [${colorize(quiz.id, "magenta")}]: ${quiz.question}`);
		});
	})
	.catch(error => {
		 errorlog(error.message);
	})
	.then(() =>{
		rl.prompt();

	});
};


exports.quitCMD = rl =>{
	rl.close();
};

exports.addCMD = rl =>{
	rl.question(colorize('Intorduzca una pregunta: ', 'red'), question => {
		rl.question(colorize('Introduzca la respuesta:', 'red'), answer => {
			model.add(question, answer);
			log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>','magenta')}${answer}`);
			rl.prompt();
		});
	});
};

exports.editCMD = (rl,id)  =>{
	if (typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	}else{
		try{

			const quiz = model.getByIndex(id);

			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

			rl.question(colorize('Intorduzca una pregunta: ', 'red'), question => {

				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

				rl.question(colorize('Introduzca la respuesta', 'red'), answer => {
				model.update(id, question, answer);
				log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize( '=>', 'magenta')} ${answer}`);
				rl.prompt();
				});
			});
		}catch(error) {
			errorlog(error.message);
			rl.prompt();
		}

	}
};
	


exports.showCMD = (rl, id)  =>{
	
	if (typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
	}else{
		try{
			const quiz = model.getByIndex(id);
			log(`[${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
		}catch(error) {
			errorlog(error.message);
		}
	}


	rl.prompt();
};

exports.testCMD = (rl, id)  =>{
	if (typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	}else{
		try{

			const quiz = model.getByIndex(id);
			log(`${colorize(quiz.question,'red')}`);
			rl.question(('Introduzca la respuesta'), resp => {

				if(resp.toLowerCase().trim() === (quiz.answer).toLowerCase().trim()){
					log(`Su respuesta es:`);
					log('Correcta','green');
					rl.prompt();
				}
				else{
					if(resp.toLowerCase().trim() !== (quiz.answer).toLowerCase().trim()){
					log(`Su respuesta es:`);
					log('Incorrecta','red');
					rl.prompt();
				}
			}
				
			});

		}catch(error){
			errorlog(error.message);
		}
	}
	rl.prompt();
};

exports.playCMD = rl =>{
	let score = 0;
	let toBeResolved = [];
	let quizzes = model.getAll();
	for(let i = 0;  i< quizzes.length;i++){
		toBeResolved[i]=quizzes[i];
	}

	const playOne = () => {
		if(toBeResolved.length === 0){
			log(`No quedan más preguntas`,'red');
			log(`Ha acertado: ${colorize(score, "green")} preguntas`);
			rl.prompt();
		}else{
			let id = Math.floor(Math.random()*toBeResolved.length);
			let quiz = quizzes[id];

			rl.question(`${colorize(quiz.question, "red")}`, resp => {
				if (resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
					score++;
					log(`¡La respuesta es correcta!`,'green');
					log(`Lleva ${colorize(score, 'green')} aciertos`);
					toBeResolved.splice(id,1);
					quizzes.splice(id,1);
					playOne();
				}else{
					log(`Incorrecta`, "red");
					Fin();
					rl.prompt();
				}
			});
		}
	};
	const Fin = () => {
		log(`Final del juego`, "red");
		log(`${colorize(score, 'magenta')} aciertos`);
	}
	playOne();

};

exports.deleteCMD = (rl, id)  =>{
	if (typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
	}else{
		try{
			 model.deleteByIndex(id);
		}catch(error) {
			errorlog(error.message);
		}
	}
	rl.prompt();
};

exports.creditsCMD = rl =>{
	log('Autores de la práctica');
    log('Alejandro Pérez', 'green');
    rl.prompt();
};