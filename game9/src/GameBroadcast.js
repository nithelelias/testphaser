/***
 *  esta clase la cree para realizar comunicaciones mas directas con los objetos del juego
 */
const GAMEBROADCASTKEY = 'game-broadcast-event'
const GameBroadcast = { emit, listen, on }
function getDocumentObject() {
  return document.body
}
function listen(_callback) {
  const handlerFnc = e => _callback(e.detail)
  getDocumentObject().addEventListener(GAMEBROADCASTKEY, handlerFnc)

  return () => {
    getDocumentObject().removeEventListener(GAMEBROADCASTKEY, handlerFnc)
  }
}

function emit(tagName, payload) {
  const custom_event = new CustomEvent('GAMEBROADCASTKEY', {
    detail: {
      name: tagName,
      payload,
    },
  })

  getDocumentObject().dispatchEvent(custom_event)
}

function on(tagName, _callback) {
  return listen(eventData => {
    if (eventData.name === tagName) {
      _callback(eventData.payload)
    }
  })
}

export default GameBroadcast
