import React from 'react';
import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

class MFSFPandemic extends Module {
  MFcasts = [];
  SFcasts = [];

  targets = {};

  PANDEMIC = 0.3;
  MOONFIRE_BASE_MS = 22000;
  SUNFIRE_BASE_MS = 18000;

  inPandemic (lastDotApplyTime, dotRefreshTime, baseDuration, dotDuration) {
    dotTimeElapsed = lastDotApplyTime - dotRefreshTime;
    pandemicThreshold = dotDuration - (baseDuration * PANDEMIC);
    return dotTimeElapsed >= pandemicThreshold;
  }

  newDuration (dotApplyTime, dotRefreshTime, baseDuration, dotDuration) {
     maxDotTime = baseDuration + (baseDuration * PANDEMIC);
     dotTimeElapsed = lastDotApplyTime - dotRefreshTime;
     remainingTime = Math.max(dotDuration - dotTimeElapsed, 0);
     refreshedTime = remainingTime + baseDuration;
     inPandemic = refreshedTime > maxDotTime;
     return Math.min(maxDotTime, refreshedTime);
  }

  isMoonfireCast(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.MOONFIRE.id;
  }
  isSunfireCast(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.SUNFIRE_CAST.id;
  }
  isMoonfire(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.MOONFIRE_BEAR.id;
  }
  isSunfire(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.SUNFIRE.id;
  }

  on_byPlayer_cast(event) {
    if (this.isMoonfireCast(event)){
      this.MFcasts.push(
        {
          timestamp: event.timestamp,
          targets: [],
        }
      );
    }

    if (this.isSunfireCast(event)){
      this.SFcasts.push(
        {
          timestamp: event.timestamp,
          targets: [],
        }
      );
    }
  }


  on_byPlayer_applydebuff(event) {
    if (this.isMoonfire(event)){

      lastApplied = targets[event.targetID].moonfire.applied;
      prevLength = targets[event.targetID].moonfire.length;
      this.newDuration(lastApplied, event.timestamp, this.MOONFIRE_BASE_MS, prevLength);

      this.MFcasts[this.MFcasts.length - 1].targets.push(
        {
          type: 'apply',
          target: event.targetID,
          applied: event.timestamp,
          source: event.ability.name,
        }
      );
    }

    if (this.isSunfire(event)){
      this.SFcasts[this.SFcasts.length - 1].targets.push(
        {
          type: 'apply',
          target: event.targetID,
          timestamp: event.timestamp,
          source: event.ability.name,
        }
      );
    }

    
    if (!this.target[event.targetID]){
      this.target[event.targetID] = { event.timestamp;
    }
  }

  on_byPlayer_refreshdebuff(event) {
    if (this.isMoonfire(event)){
      this.MFcasts[this.MFcasts.length - 1].targets.push(
        {
          type: 'refresh',
          target: event.targetID,
          timestamp: event.timestamp,
          source: event.ability.name,
        }
      );
    }

    if (this.isSunfire(event)){
      if (!this.SFcasts[this.SFcasts.length - 1]) return;
      this.SFcasts[this.SFcasts.length - 1].targets.push(
        {
          type: 'refresh',
          target: event.targetID,
          timestamp: event.timestamp,
          source: event.ability.name,
        }
      );
    }
  }

  on_finished() {
    const a = 1;
  }

  /*suggestions(when) {
    const suboptPerMin = ((this.suboptUmempLS) / (this.owner.fightDuration / 1000)) * 60;
    when(suboptPerMin).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You casted {this.suboptUmempLS} unempowered <SpellLink id={SPELLS.LUNAR_STRIKE.id} /> that hit less than 3 targets. Always prioritize Solar Wrath as a filler if there are less than 3 targets.</span>)
          .icon(SPELLS.LUNAR_STRIKE.icon)
          .actual(`${formatNumber(actual)} Unempowered LS per minute`)
          .recommended(`${recommended} Unempowered LS that hits less than 3 targets are recomended`)
          .regular(recommended + 2).major(recommended + 4);
      });
  }*/
}

export default MFSFPandemic;
