/* global document, Audio, Immutable */

const elements = {
  correct:   document.querySelector('#correct'),
  fail:      document.querySelector('#fail'),
  feedback:  document.querySelector('#feedback'),
  form:      document.querySelector('#form'),
  input:     document.querySelector('#input'),
  result:    document.querySelector('#result'),
  speak:     document.querySelector('#speak'),
  wordnr:    document.querySelector('#wordnr'),
  wordcount: document.querySelector('#wordcount'),
}

const bindSpeaker = (sound) => {
  elements.speak.onclick = () => sound.play()
}

const bindForm = (word, next) => new Promise((res, rej) => {
  elements.form.onsubmit = () => {
    if (elements.input.value === word) {
      elements.input.value = ''
      res()
    } else {
      elements.input.select()
      rej()
    }

    return false
  }
})

const consumeList = (list, call) => call(list.first())
      .then(() => consumeList(list.shift(), call))


const start = ({ onCorrect, onFail, onNewWord, onNewList, list }) => {
  onNewList(list.size)

  const nextWord = (subList) => new Promise((res) => {
    if (subList.size === 0) return res()

    onNewWord()
    elements.input.focus()
    const { word, audio } = subList.first()
    const sound = new Audio(audio)
    bindSpeaker(sound)
    sound.play()

    return bindForm(word)
      .then(() => onCorrect(word))
      .catch(() => onFail(word))
      .then(() => nextWord(subList.shift()))
      .then(res)
  })

  nextWord(list)
    .then(() => {
      console.log('end of list')
      elements.input.disabled = 'disabled'
    })
}

const addResult = (word, success) => {
  const resultRow = document.createElement('tr')
  resultRow.className = success ? 'correct' : 'fail'

  const wordField = document.createElement('td')
  wordField.innerHTML = word
  resultRow.appendChild(wordField)

  const resultField = document.createElement('td')
  resultField.innerHTML = success ? '👍' : '👎'
  resultRow.appendChild(resultField)

  elements.result.appendChild(resultRow)
}

start({
  onCorrect(word) {
    elements.feedback.innerHTML = '👍'
    elements.feedback.className = 'correct'
    setTimeout(() => { elements.feedback.innerHTML = '' }, 1000)

    addResult(word, true)
  },
  onFail(word) {
    elements.feedback.innerHTML = '👎'
    elements.feedback.className = 'fail'
    setTimeout(() => { elements.feedback.innerHTML = '' }, 1000)

    addResult(word, false)
  },
  onNewWord()       { elements.wordnr.innerHTML++ },
  onNewList(length) { elements.wordcount.innerHTML = length },
  list: new Immutable.List([
    {
      word:  'mat',
      audio: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Sv-mat.ogg',
    },
    {
      word:  'ful',
      audio: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Sv-ful.ogg',
    },
  ]),
})
