import { SENIORITY_LEVELS } from "./constants.js";
import COMPANIES from "./data/companies.js";
import JOBTYPES from "./data/jobtypes.js";
import KNOWLEDGE_ROADMAP from "./data/knowledgeMap.js";
import Job from "./models/job.js";
import JobRequirement from "./models/jobRequirement.js";
import STATE from "./state.js";
import { iterate, random } from "./utils.js";

const SALARY_BASE = 6;
const SALARY_PLUS_BASE = 2;
const MAX_POSIBLE_SENIORITY_LEVEL = SENIORITY_LEVELS.length - 1;
const MAX_IDX_COMPANIES = COMPANIES.length - 1;
const JobPool = [];
var lastJobSeekDay = 0;
function getDateNumber(date) {
  return date.day + date.month * 30 + date.year * 12 * 30;
}
function addDaysToDate(date, days) {
  date.day += days;
  if (date.day > 30) {
    date.day = 1;
    date.month += 1;
  }
  if (date.month > 12) {
    date.month = 1;
    date.year += 1;
  }
  return date;
}
function removeExpirateJobs() {
  let repeat = false;
  let currentDateNumber = getDateNumber(STATE.DATE);
  while (repeat) {
    repeat = false;
    for (let i in JobPool) {
      let expirationDateNumber = getDateNumber(JobPool[i].expirationDate);

      if (currentDateNumber > expirationDateNumber) {
        JobPool.splice(parseInt(i), 1);
        repeat = true;
        break;
      }
    }
  }
}
export function isJobExpired(job) {
  return getDateNumber(STATE.DATE) > getDateNumber(job.expirationDate);
}
export function getJobDaysDiff(job) {
  return getDateNumber(job.expirationDate) - getDateNumber(STATE.DATE);
}
export function getJobPool() {
  return JobPool;
}
function createJobRequirementRndLevel(topic) {
  let jr = new JobRequirement();
  jr.knowledge = topic;
  jr.knowledge_level = 0;
  iterate(5, () => {
    jr.knowledge_level += random(1, 20);
  });
  return jr;
}
function getJobRandomRequirements(jobType, seniorityChoose) {
  let dic = {};
  let posibleSeniorityKnowledge = [
    ...KNOWLEDGE_ROADMAP[seniorityChoose],
    ...jobType.requireKnowledge,
  ];
  let req = [];
  let maxIdx = posibleSeniorityKnowledge.length - 1;
  let maxIter = random(3, 5);
  while (maxIter > 0) {
    let topic = posibleSeniorityKnowledge[random(0, maxIdx)];
    if (!dic.hasOwnProperty(topic)) {
      dic[topic] = 1;
      req.push(createJobRequirementRndLevel(topic));
    }
    maxIter--;
  }

  return req;
}
function calcJobSalary(job) {
  job.salary = SALARY_BASE * (job.seniority_level + 1);
  job.requirements.forEach((req) => {
    job.salary += parseInt((req.knowledge_level / 100) * SALARY_PLUS_BASE);
  });
}
function addJobToPool(jobType) {
  let newjob = new Job();
  let companyName = COMPANIES[random(0, MAX_IDX_COMPANIES)];
  let seniorityJobLevel = STATE.tutorial
    ? jobType.level
    : random(
        jobType.level,
        Math.min(MAX_POSIBLE_SENIORITY_LEVEL, STATE.SENIORITY + 1)
      );

  // FROM CURRENT DATE
  let expirationDate = addDaysToDate(
    {
      day: STATE.DATE.day + 0,
      month: STATE.DATE.month + 0,
      year: STATE.DATE.year,
    },
    random(2, 10)
  );
  let seniorityChoose = SENIORITY_LEVELS[seniorityJobLevel];
  let requirements = STATE.tutorial
    ? []
    : getJobRandomRequirements(jobType, seniorityChoose, seniorityJobLevel);

  newjob = Object.assign(newjob, {
    jobTitle: jobType.type,
    seniority: seniorityChoose,
    seniority_level: seniorityJobLevel,
    companyName,
    description: "Se Busca Persona con los siguientes conocimientos ",
    salary: 0,
    requirements,
    expirationDate,
  });
  if (STATE.tutorial) {
    newjob.salary = 2;
  } else {
    calcJobSalary(newjob);
  }
  JobPool.push(newjob);
}

export function populateNewJobOfferts() {
  // ITERATE POOL AND REMOVE JOB PASSED
  if (STATE.tutorial) {
    addJobToPool({
      type: "Asistente de Tutor de computacion",
      requireKnowledge: [],
      level: 0,
    });
    return;
  }
  removeExpirateJobs();
  if (lastJobSeekDay === STATE.DATE.day) {
    return;
  }
  lastJobSeekDay = STATE.DATE.day;

  // ADD NEW JOB OFFERS
  let total = STATE.tutorial
    ? 1
    : Math.max(1, random(STATE.SENIORITY, STATE.SENIORITY * 2));

  let posibleJobList = JOBTYPES.filter((jobtype) => {
    return jobtype.level <= STATE.SENIORITY;
  });
  const maxrndIdx = posibleJobList.length - 1;

  iterate(total, (i) => {
    let rnd = random(0, maxrndIdx);
    let jobType = posibleJobList[rnd];
    addJobToPool(jobType);
  });
}

export function calcJobOfferSuccesProb(job) {
  let value = STATE.SENIORITY >= job.seniority_level ? 50 : 0;
  let maxProbReqValue = 50 / job.requirements.length;

  job.requirements.forEach((req) => {
    let personal_knowledege_level = STATE.KNOWLEDGE[req.knowledge] || 0;
    if (personal_knowledege_level > 0) {
      value +=
        maxProbReqValue *
        Math.min(1, personal_knowledege_level / req.knowledge_level);
    }
  });
  value = parseInt(value);
  return value;
}

export function removeJobFromPool(job) {
  for (let idx in JobPool) {
    let _job = JobPool[idx];
    if (_job === job) {
      JobPool.splice(idx, 1);
      break;
    }
  }
}
