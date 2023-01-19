function getRandomValue(max, min) {
  return Math.floor((Math.random() * (max + min)) + min / 2)
}

const starterButtonIndicatorPosition = () => {
  const boundries = document.querySelector(`#facil`).getBoundingClientRect();
  return Math.floor((boundries.left + boundries.right) / 2);
}

const app = Vue.createApp({
  data() {
    return {
      // Num. Variables
      monsterHealth: 100,
      playerHealth: 100,
      currRounds: 0,
      specialAttackRound: 0,
      healRound: 0,
      combatLog: [],
      damageDealt: 0,
      damageReceived: 0,
      centerOfButton: -200,
      difficultyValue: 0,
      damageIncrease: 0,

      // Flags
      isSPCooldown: false,
      isHealCooldown: false,
      powerUp: {canPowerUp: false, isPoweredUp: false, text: 'POWER UP'},
    }
  },
  watch: {
    currRounds(value) {
      if(value > 0){
        if (value === this.specialAttackRound + 4 && this.isSPCooldown) {
          this.isSPCooldown = false
        }
        if (value === this.healRound + 3 && this.isHealCooldown) {
          this.isHealCooldown = false
        }
      }
      if(value >= 3 && !this.powerUp.isPoweredUp){
        this.powerUp.canPowerUp = true;
        this.powerUp.isPoweredUp = true;
      }
    },
  },
  methods: {
    powerUpButton(){
      this.damageIncrease = 3;
      this.powerUp.canPowerUp = false;
      this.powerUp =  {canPowerUp: true, canPowerUp: false, text: 'POWERED UP!'}
    },
    restart() {
      this.monsterHealth = 100
      this.playerHealth = 100
      this.currRounds = 0
      this.specialAttackRound = 0
      this.healRound = 0
      this.combatLog = []
      this.damageDealt = 0
      this.damageReceived = 0
      this.centerOfButton = starterButtonIndicatorPosition();
      this.isSPCooldown = false
      this.isHealCooldown = false
      this.powerUp = {...rest, isPoweredUp: false, text: 'POWER UP'}
    },
    calculateButtonCenter(event) {
      const boundries = event.target.getBoundingClientRect()
      this.centerOfButton = Math.floor((boundries.left + boundries.right) / 2);
      switch (event.target.id) {
        case 'facil':
          this.difficultyValue = 0.5
          break
        case 'medio':
          this.difficultyValue = 1
          break
        case 'dificil':
          this.difficultyValue = 3
          break
      }
    },
    addLog(who, value, action) {
      switch (action) {
        case 'ATK':
          this.combatLog.unshift({
            entity: `${who}`,
            value: `${value}`,
            message: 'damage',
          })
          break
        case 'HEAL':
          this.combatLog.unshift({
            entity: `${who}`,
            value: `${value}`,
            message: 'heal',
          })
      }
    },
    playerAttack() {
      if(this.difficultyValue === 0){
        this.difficultyValue = 0.5;
        this.centerOfButton = starterButtonIndicatorPosition();
      }
      this.currRounds++
      const playerDamage = getRandomValue(15 + this.damageIncrease, 3 + this.damageIncrease)
      this.monsterHealth -= playerDamage
      this.damageDealt += playerDamage
      this.addLog('Player', playerDamage, 'ATK')
      this.monsterAttack()
    },
    monsterAttack() {
      const monsterDamage = getRandomValue(
        15 + this.difficultyValue * 1.5,
        3 + this.difficultyValue * 1.5
      )
      this.playerHealth -= monsterDamage
      this.addLog('Monster', monsterDamage, 'ATK')
      this.damageReceived += monsterDamage
      this.checkHealth()
    },
    specialPlayerAttack() {
      this.currRounds++
      const attackValue = getRandomValue(25, 10)
      this.addLog('Player', attackValue, 'ATK')
      this.damageDealt += attackValue
      this.monsterHealth -= attackValue
      this.isSPCooldown = true
      this.specialAttackRound = this.currRounds
      this.monsterAttack()
    },
    checkHealth() {
      if (this.playerHealth < 0) {
        this.playerHealth = 0
      }
      if (this.monsterHealth < 0) {
        this.monsterHealth = 0
      }
    },
    heal() {
      this.currRounds++
      const heal = getRandomValue(8, 3)
      this.playerHealth + heal > 100
        ? (this.playerHealth = 100)
        : (this.playerHealth += heal)

      this.addLog('Player', heal, 'HEAL')
      this.healRound = this.currRounds
      this.isHealCooldown = true
    },
    surrender() {
      this.playerHealth = 0
    },
  },
  computed: {
    difficultyButtons() {
      if (this.monsterHealth === 100 && this.playerHealth === 100) {
        return {
          status: false,
          class: 'difficulty',
        }
      }
      return {
        status: true,
        class: 'disabled',
      }
    },
    endOfRound() {
      if(!(this.monsterHealth * this.playerHealth)){
        return true
      }
    },
    calculatePlayerHealth() {
      return {
        width: this.playerHealth + '%',
        transition: '0.3s',
        display: 'flex',
        alignItems: 'center',
        backgroundColor:
          this.playerHealth > 50
            ? '#00a876'
            : this.playerHealth > 25
            ? '#bbc7029e'
            : '#ab0505ad',
      }
    },
    calculateMonsterHealth() {
      return {
        width: this.monsterHealth + '%',
        transition: '0.5s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    },
    setResult() {
      if (this.playerHealth > 0 && this.monsterHealth > 0) {
        return 'Battle Log'
      } else if (this.playerHealth <= 0 && this.monsterHealth > 0) {
        return 'DEFEAT'
      } else if (this.playerHealth > 0 && this.monsterHealth <= 0) {
        return 'WIN'
      } else if (this.playerHealth <= 0 && this.monsterHealth <= 0) {
        return 'DRAW'
      }
    },
    difficultySelection() {
      return {
        position: 'absolute',
        height: '10px',
        width: '10px',
        fontSize: '1.2rem',
        transform: 'rotate(180deg)',
        color: '#880017',
        left: `${this.centerOfButton}px`,
        top: '135px',
        transition: '0.3s',
      }
    },
  },
})

app.mount('#game')

document.addEventListener('resize', (event) => {
  calculateButtonCenter(event);
})