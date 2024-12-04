

export const validateForm = (data, setInvalidFields) => {
  let invalid = 0;

  const formPayload = Object.entries(data)

  for (let arr of formPayload) {

    const value = typeof arr[1] === 'string' ? arr[1].trim() : arr[1];
    if (!value || value === '') {
      invalid++
      setInvalidFields(prev => [...prev, { name: arr[0], message: 'This fields is invalid' }])
    }
  }

  for (let arr of formPayload) {
    switch (arr[0]) {
      case "start_date":
        const date1 = arr[1]
        const startDate = new Date(date1)
        if (startDate <= Date.now()) {
          invalid++
          setInvalidFields(prev => [...prev, { name: arr[0], message: 'Start date must be greater then today' }])
        }
        break;
      case "end_date":
        const date = arr[1]
        const endDate = new Date(date)

        const startDateFields = formPayload.find(item => item[0] === 'start_date')
        const startDateF = startDateFields ? new Date(startDateFields[1]) : null

        if (endDate <= Date.now()) {
          invalid++
          setInvalidFields(prev => [...prev, { name: arr[0], message: 'End date must be greater then today' }])
        } else if (startDateF && endDate <= startDateF) {
          invalid++
          setInvalidFields(prev => [...prev, { name: arr[0], message: 'End date must be greater then start date' }])
        }
        break;
      case "starting_price":
        if (arr[1] <= 0) {
          invalid++
          setInvalidFields(prev => [...prev, { name: arr[0], message: 'Starting price must be greater than 0' }])
        }
        break;
      case "bid_step":
        if (arr[1] <= 0) {
          invalid++
          setInvalidFields(prev => [...prev, { name: arr[0], message: 'Bid step must be greater than 0' }])
        }
        break;

      default:
        break;
    }
  }

  return invalid
}


