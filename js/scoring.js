/**
 * CFB Pickems — Scoring Engine v5 (unchanged logic from v4)
 * No-decision scoring, tiebreaker-aware rankings, season stats by correct picks.
 */

import { PICK_RESULT, GAME_STATUS, getAlmaMaterMatch } from './data-model.js';
import { getTiebreakerGuess } from './storage.js';

export function calculateAtsWinner(game) {
  const { homeScore, awayScore, lockedSpread, homeTeam, awayTeam, status } = game;
  if (status !== GAME_STATUS.FINAL) return null;
  if (homeScore===null||awayScore===null||lockedSpread===null) return null;
  const adjusted = homeScore + lockedSpread;
  const diff = adjusted - awayScore;
  if (Math.abs(diff) < 0.01) return 'no_decision';
  return diff > 0 ? homeTeam : awayTeam;
}

export function evaluatePick(pick, game) {
  if (!game) return PICK_RESULT.PENDING;
  if (game.status===GAME_STATUS.SCHEDULED) return PICK_RESULT.PENDING;
  if (game.status===GAME_STATUS.LIVE)      return PICK_RESULT.LIVE;
  const atsWinner = game.atsWinner ?? calculateAtsWinner(game);
  if (!atsWinner) return PICK_RESULT.PENDING;
  if (atsWinner==='no_decision') return PICK_RESULT.NO_DECISION;
  return atsWinner===pick.selectedTeam ? PICK_RESULT.WIN : PICK_RESULT.LOSS;
}

export function pointsForResult(result) {
  return result===PICK_RESULT.WIN ? 1 : 0;
}

export function calculateWeeklyResults(weekId, players, picks, games, actualTiebreaker=null) {
  const results = players.map(player => {
    const pp = picks.filter(p=>p.weekId===weekId&&p.playerId===player.playerId);
    let correct=0, incorrect=0, noDecisions=0, pending=0;
    for (const pick of pp) {
      const game=games.find(g=>g.gameId===pick.gameId);
      if(!game) continue;
      const r=evaluatePick(pick,game);
      if(r===PICK_RESULT.WIN) correct++;
      else if(r===PICK_RESULT.LOSS) incorrect++;
      else if(r===PICK_RESULT.NO_DECISION) noDecisions++;
      else pending++;
    }
    const tbGuess = getTiebreakerGuess(weekId, player.playerId);
    const tbDelta = (actualTiebreaker!==null&&tbGuess!==null) ? Math.abs(tbGuess-actualTiebreaker) : null;
    return {
      resultId:`wr_${weekId}_${player.playerId}`,
      weekId, playerId:player.playerId, displayName:player.displayName,
      correctPicks:correct, incorrectPicks:incorrect, noDecisions, pending,
      tiebreakerGuess:tbGuess, tiebreakerDelta:tbDelta,
      rank:0, isWinner:false, isLoser:false, wonByTiebreaker:false,
    };
  });

  results.sort((a,b)=>{
    const d=b.correctPicks-a.correctPicks; if(d!==0) return d;
    if(a.tiebreakerDelta===null&&b.tiebreakerDelta===null) return 0;
    if(a.tiebreakerDelta===null) return 1;
    if(b.tiebreakerDelta===null) return -1;
    return a.tiebreakerDelta-b.tiebreakerDelta;
  });

  results.forEach((r,i)=>{ r.rank=i+1; });
  const anyFinal=games.some(g=>g.status===GAME_STATUS.FINAL);
  if(anyFinal&&results.length>1){
    results[0].isWinner=true;
    if(results[1]&&results[0].correctPicks===results[1].correctPicks) results[0].wonByTiebreaker=true;
    results[results.length-1].isLoser=true;
    const last=results[results.length-1];
    const sl=results[results.length-2];
    if(sl&&last.correctPicks===sl.correctPicks) last.wonByTiebreaker=true;
  }
  return results;
}

export function calculateAlmaMaterTotal(games, almaMaters, calcMode='selectedSlateOnly') {
  const ag=games.filter(g=>{
    const isAlma = !!(getAlmaMaterMatch(g.homeTeam) || getAlmaMaterMatch(g.awayTeam));
    return calcMode==='selectedSlateOnly'?g.isAlmaMaterGame&&isAlma:isAlma;
  });
  if(!ag.length) return null;
  const fg=ag.filter(g=>g.status===GAME_STATUS.FINAL&&g.homeScore!==null);
  if(!fg.length) return null;
  let total=0;
  for(const g of fg){
    const hA=almaMaters.some(am=>g.homeTeam.toLowerCase().includes(am.toLowerCase()));
    const aA=almaMaters.some(am=>g.awayTeam.toLowerCase().includes(am.toLowerCase()));
    if(hA) total+=g.homeScore||0;
    if(aA) total+=g.awayScore||0;
  }
  return total;
}

export function calculateSeasonStandings(players, allWeeklyResults) {
  const standings=players.map(player=>{
    const pr=allWeeklyResults.filter(r=>r.playerId===player.playerId);
    const totalCorrect=pr.reduce((s,r)=>s+(r.correctPicks||0),0);
    const totalIncorrect=pr.reduce((s,r)=>s+(r.incorrectPicks||0),0);
    const totalND=pr.reduce((s,r)=>s+(r.noDecisions||0),0);
    const weeklyWins=pr.filter(r=>r.isWinner).length;
    const weeklyLosses=pr.filter(r=>r.isLoser).length;
    const totalGames=totalCorrect+totalIncorrect+totalND;
    const winPct=totalGames>0?Math.round((totalCorrect/totalGames)*1000)/10:0;
    return{playerId:player.playerId,displayName:player.displayName,totalCorrect,totalIncorrect,totalND,weeklyWins,weeklyLosses,winPct,currentRank:0,isSeasonLeader:false,isCurrentLastPlace:false};
  });
  standings.sort((a,b)=>b.totalCorrect-a.totalCorrect||b.winPct-a.winPct);
  standings.forEach((s,i)=>{s.currentRank=i+1;});
  if(standings.length>1){standings[0].isSeasonLeader=true;standings[standings.length-1].isCurrentLastPlace=true;}
  return standings;
}

export function getPickStatusLabel(result) {
  return{win:'✅ Correct',loss:'❌ Wrong',no_decision:'— No Decision',live:'🔴 Live',pending:'⏳ Pending'}[result]||'—';
}
export function getPickStatusClass(result) {
  return{win:'result-win',loss:'result-loss',no_decision:'result-nd',live:'result-live'}[result]||'result-pending';
}
