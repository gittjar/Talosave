const colorMap = {
    2000: 'passionfruit',
    2001: 'skyblue',
    2002: 'tan',
    2003: 'yellow',
    2004: 'rosewood',
    2005: 'darkorange',
    2006: 'teal',
    2007: 'silver',
    2008: 'grey',
    2009: 'banana',
    2010: 'cyan',
    2011: 'magenta',
    2012: 'lime',
    2013: 'maroon',
    2014: 'gold',
    2015: 'olive',
    2016: 'limegreen',
    2017: 'tomato',
    2018: 'gold',
    2019: 'lightblue',
    2020: 'goldenrod',
    2021: 'mediumseagreen',
    2022: 'lightcoral',
    2023: 'orange',
    2024: 'pink',
    2025: 'gray',
    2026: 'lightgreen',
    2027: 'lightgrey',
    2028: 'lightpink',
    2029: 'darkgrey',
    2030: 'lightyellow',
    2031: 'lightseagreen',
    getColor: function(year) {
      return this[year];
    }
  };
  
  export default colorMap;