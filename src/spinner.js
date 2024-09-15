import chalk from 'chalk'

export class Spinner {
  constructor({ text, stream, l: indentLevel }) {
    this.stream = stream ?? process.stdout
    this.text = text
    this.indentLevel = indentLevel ?? 0
    this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    this.interval = 80
    this.index = 0
    this.intervalId = null
    this.status = 'running'
  }

  start = () => {
    // disable cursor
    this.stream.write('\x1B[?25l')

    this.intervalId = setInterval(() => {
      if (this.index === this.frames.length - 1) {
        this.index = 0
      } else {
        this.index++
      }

      this.render()
    }, this.interval)
  }

  stop = ({ status = 'success', text }) => {
    this.status = status
    this.text = text || text === '' ? text : this.text

    if (this.intervalId) {
      clearInterval(this.intervalId)
    }

    this.render()

    // enable cursor
    this.stream.write('\x1B[?25h')

    if (this.text) {
      this.stream.write('\n')
    }
  }

  update = ({ text }) => {
    this.text = text
  }

  getSymbol = () => {
    if (!this.status) {
      return ''
    } else if (this.status === 'running') {
      return chalk.green(this.frames[this.index])
    } else {
      return this.status === 'success' ? chalk.green('✔') : chalk.red('✖')
    }
  }

  render = () => {
    this.stream.clearLine()
    this.stream.cursorTo(0)

    if (!this.text) {
      return
    }

    const indent = ' '.repeat(this.indentLevel * 2)
    this.stream.write(`${indent}${this.getSymbol()} ${this.text}`)
  }
}
