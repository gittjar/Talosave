const colorMap = {
    2019: 'lightblue',
    2020: 'darkblue',
    2021: 'green',
    2022: 'khaki',
    2023: 'orange',
    2024: 'pink',
    2025: 'purple',
    2026: 'lightgreen',
    2027: 'lightgrey',
    getColor: function(year) {
      return this[year];
    }
  };

export default colorMap;