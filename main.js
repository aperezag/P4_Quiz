const readline = require('readline');


const figlet = require('figlet');
const chalk = require('chalk');


const colorize = (msg, color) => {
	if (typeof color !=="undefined"){
		msg = chalk[color].bold(msg);
	}
	return msg;
};

const log = (msg, color) => {
	console.log(colorize(msg, color));
};

const biglog = (msg, color) => {
	log(figlet.textSync(msg, {horizontalLayout: 'full'}),color);
};

const errorlog = (emsg) => {
	console.log(`${colorize("Error","red")}: ${colorize(colorize(emsg, "red"), "bgYellowBrigth")}`);
};
//Mensaje Inicial
biglog('CORE Quiz', 'green');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: colorize("quiz> ", 'blue'),
  completer: (line) => {
	  const completions = 'h help add delete edit test p play credits q quit'.split(' ');
	  const hits = completions.filter((c) => c.startsWith(line));
	  // show all completions if none found
	  return [hits.length ? hits : completions, line];
  }
});

rl.prompt();

rl
.on('line', (line) => {

  let args = line.split(" ");
  let cmd = args[0].toLowerCase().trim();


  switch (cmd) {
  	case '':
  	  rl.prompt();
  	  break;

    case 'h':
    case 'help':
    	helpCMD();
      break;
    case 'quit':
    case'q':
      quitCMD();
      break;

    case 'edit':
      editCMD(args[1]);
      break;

    case 'add':
      addCMD();
      break;

    case 'list':
      listCMD();
      break;

    case 'show':
      showCMD(args[1]);
      break;

    case 'test':
      testCMD(args[1]);
      break;


    case 'play':
    case 'p':
      playCMD();
      break;

    
    case 'delete':
      deleteCMD(args[1]);
      break;

    case 'credits':
      creditsCMD();
      break;

    default:
      console.log(`Comando desconocido: '${colorize(cmd, 'red')}'`);
      console.log(`Use 'help' para ver todos los comandos disponibles.`);
      rl.prompt();
      break;
  }

})
.on('close', () => {
  log('Ciao');
  process.exit(0);
});

const helpCMD = () =>{
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

const listCMD = () =>{
	 log('Listar todos los quizzes existentes.', 'red');
	 rl.prompt();
}

const quitCMD = () =>{
	rl.close();
}

const addCMD = () =>{
	log('Añadir un nuevo quiz.', 'red');
	rl.prompt();
}

const editCMD = id  =>{
	log('Editar el quiz indicado.', 'red');
	rl.prompt();
}

const showCMD = id  =>{
	log('Mostrar el quiz indicado.', 'red');
	rl.prompt();
}

const testCMD = id  =>{
	log('Probar el quiz indicado.','red');
	rl.prompt();
}

const playCMD = () =>{
	log('Jugar.', 'red');
	rl.prompt();
}

const deleteCMD = id  =>{
	log('Borrar el quiz indicado.', 'red');
	rl.prompt();
}

const creditsCMD = () =>{
	log('Autores de la práctica');
    log('Alejandro Pérez', 'green');
    rl.prompt();
}
