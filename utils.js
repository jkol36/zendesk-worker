export const eliminateDuplicates = (array) => {
  let obj = {}
  let out = []
  for(let i=0; i<array.length; i++) {
    obj[array[i]] = 0
  }
  for (let x in obj) {
    out.push(x)
  }
  return out
}

export const calculatePercentageDone = (array, item) => {
  let x = array.indexOf(item)
  let y = x+1
  return y/array.length
}