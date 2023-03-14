import JOBTYPES from "./jobtypes.js";

const KNOWLEDGE_ROADMAP = {
  aprendiz: ["computacion", "sistemas operativos", "algoritmos"],
  junior: [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "jQuery",
    "Control de versiones (Git)",
    "Web Services",
    "Principios codigo Limpio",
  ],
  intermedio: [
    "Estrategias de Versiones (GitFlow)",
    "Conceptos de estilos: Preprocesadores de estilos Sass",
    "Conceptos de estilos: Patrones de nombramiento Bem",
    "Desarrollo móvil responsive",
    "Patron de manejo de estados: Redux",
    "Patron de manejo de estados: ContextApi",
    "Patron de manejo de estados: ngRX",
    "Node.js",
    "WebPack",
    "Algoritmos avanzados",
    "Conceptos de Web Service Security",
    "Tecnicas de SEO ",
    "Pruebas unitarias y de integración",
    "iOS",
    "Android",
    "Swift",
    "Kotlin",
    "Unity",
    "C#",
    "diseño de juegos",
    "SQL",
    "SQL-LITE",
    "noSQL",
    "Java",
    "Python", 
  ],
  senior: [
    "Control de Versionamiento pull request",
    "Estilos Graficos UX Avanzado",
    "Principios SOLID",
    "Principios YAGNI",
    "Principios DRY",
    "Principios KISS",
    "Angular",
    "Vue.js",
    "C++",
    "AWS",
    "Habilidades de liderazgo y gestión de equipo",
    "Metodologia agil Kanban",
    "Metodologia agil SCRUM",
    "Diseño avanzado: Accesibilidad",  
    "Machine Learning IA",
    "criptografía",

  ],
  master: [
    "Investigación y desarrollo de nuevas tecnologías y herramientas",
    "Participación en proyectos Open Source",
    "Conocimiento avanzado de algoritmos y estructuras de datos",
    "Optimización de rendimiento de aplicaciones web a gran escala",
    "Conocimiento avanzado de frameworks como React Native o Vue.js",
    "Diseño y arquitectura de microservicios",
    "Habilidades avanzadas de liderazgo y gestión de equipo",
    "Conocimiento de metodologías avanzadas de desarrollo ágil como Lean Startup o DevOps",
  ],
};

// const found = {};
// for (let i in KNOWLEDGE_ROADMAP) {
//   KNOWLEDGE_ROADMAP[i].forEach((topic) => {
//     found[topic] = 1;
//   });
// }

// // ADD TO intermediate tools
// JOBTYPES.forEach((jobtype) => {
//   jobtype.requireKnowledge.forEach((topic) => {
//     if (!found.hasOwnProperty(topic)) {
//       KNOWLEDGE_ROADMAP.intermedio.push(topic);
//       found[topic] = 1;
//     }
//   });
// });
export default KNOWLEDGE_ROADMAP;
