import '../CSS/Supplier.css'

function StatusBox (props) {
  return (
    <div className='box-container'>
      <div className='row'>
        <h2 className='title'>{props.title}</h2>
      </div>
      <div className='row'>
        <h2 className='value'>{props.balance}</h2>
      </div>
    </div>
  )
}

export default StatusBox
