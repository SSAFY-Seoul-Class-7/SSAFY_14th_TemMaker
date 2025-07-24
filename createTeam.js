import { saveTeams, saveWeights } from "./setLog.js";

function shuffle(array = []) {
  for (let i = array.length - 1; i > 0; i--) {
    // i와 0 사이에서 랜덤한 인덱스 선택
    const j = Math.floor(Math.random() * (i + 1));
    // 두 요소를 스왑
    [array[i], array[j]] = [array[j], array[i]];
  }
  // 최종 셔플 후 다시 한 번 랜덤하게 교환
  for (let i = 0; i < array.length; i++) {
    let j = Math.floor(Math.random() * array.length);
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

const shift = (array = []) => {
  const newArr = [];
  // 1. 각 열번호에 따라 0, 1, 2, 3 칸 아래로 밀기
  for (let i = 0; i < array.length; i++) {
    let newIdx = i + (i % 4) * 4;

    if (newIdx >= array.length) {
      newIdx = newIdx % array.length;
    }

    newArr[newIdx] = array[i];
  }

  return newArr;
};

export function createTeams(array, teamSize) {
  let shiftArray = shift(array);
  let shuffledArray = shuffle(shiftArray);

  let teams = [];

  for (let i = 0; i < shuffledArray.length; i += teamSize) {
    teams.push(shuffledArray.slice(i, i + teamSize));
  }
  saveTeams(teams);

  return teams;
}

export function createTeamsV2(array, weights, teamSize) {
  let teams = [];
  let usedMembers = new Set();

  while (usedMembers.size < array.length) {
    let team = [];
    let availableMembers = shuffle(
      array.filter((member) => !usedMembers.has(member))
    );

    while (team.length < teamSize && availableMembers.length > 0) {
      availableMembers.sort((a, b) => {
        let weightA = team.reduce((sum, member) => sum + weights[member][a], 0);
        let weightB = team.reduce((sum, member) => sum + weights[member][b], 0);
        return weightA - weightB;
      });

      let selectedMember = availableMembers.shift();
      team.push(selectedMember);
      usedMembers.add(selectedMember);
    }

    teams.push(team);

    // 가중치 증가
    team.forEach((member) => {
      team.forEach((other) => {
        if (member !== other) {
          weights[member][other]++;
        }
      });
    });
  }

  saveTeams(teams);
  saveWeights(weights);

  return teams;
}

function getToday() {
  const date = new Date();
  return { month: date.getMonth() + 1, date: date.getDate() };
}

export function teamsToString(teams) {
  const { month, date } = getToday();
  const title = `### :party_blob: :rice: ${month}월 ${
    date
  }일 밥 같이 먹어요 :rice: :party_blob: :cat_feed:`;
  const teamList = teams
    .map((team, index) => `**${index + 1}조**    ➡    ${team.join("\t")}`)
    .join("\n");

  const message = `${title}\n${teamList}`;
  return message;
}
