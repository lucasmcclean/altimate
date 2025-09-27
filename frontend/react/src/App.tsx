import Graph from './components/graph'
import Switcher from './components/Switcher'
import nodes from "./tempJson"

function App() {
  return (
    <>
		<Switcher />

		<Graph nodes={nodes}/>
    </>
  )
}

export default App
