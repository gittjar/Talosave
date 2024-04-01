const colorMap = {
    2000: 'red',
    2001: 'blue',
    2002: 'green',
    2003: 'yellow',
    2004: 'purple',
    2005: 'pink',
    2006: 'orange',
    2007: 'brown',
    2008: 'grey',
    2009: 'black',
    2010: 'cyan',
    2011: 'magenta',
    2012: 'lime',
    2013: 'maroon',
    2014: 'navy',
    2015: 'olive',
    2016: 'teal',
    2017: 'silver',
    2018: 'gold',
    2019: 'lightblue',
    2020: 'darkblue',
    2021: 'green',
    2022: 'khaki',
    2023: 'orange',
    2024: 'pink',
    2025: 'purple',
    2026: 'lightgreen',
    2027: 'lightgrey',
    2028: 'darkgreen',
    2029: 'darkgrey',
    2030: 'lightyellow',
    getColor: function(year) {
      return this[year];
    }
  };
  
  export default colorMap;