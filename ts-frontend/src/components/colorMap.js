const colorMap = {
    2000: '#8B008B',     // darkmagenta
    2001: '#4169E1',     // royalblue
    2002: '#D2691E',     // chocolate
    2003: '#FFB600',     // dark yellow
    2004: '#8B4513',     // saddlebrown
    2005: '#FF8C00',     // darkorange
    2006: '#008B8B',     // darkcyan
    2007: '#708090',     // slategray
    2008: '#696969',     // dimgray
    2009: '#FF8C00',     // darker orange
    2010: '#00CED1',     // darkturquoise
    2011: '#FF1493',     // deeppink
    2012: '#32CD32',     // limegreen
    2013: '#800000',     // maroon
    2014: '#DAA520',     // goldenrod
    2015: '#556B2F',     // darkolivegreen
    2016: '#228B22',     // forestgreen
    2017: '#DC143C',     // crimson
    2018: '#B8860B',     // darkgoldenrod
    2019: '#4682B4',     // steelblue
    2020: '#CD853F',     // peru
    2021: '#3CB371',     // mediumseagreen
    2022: '#F08080',     // lightcoral
    2023: '#FF6347',     // tomato
    2024: '#DB7093',     // palevioletred
    2025: '#6B8E23',     // olivedrab
    2026: '#20B2AA',     // lightseagreen
    2027: '#9370DB',     // mediumpurple
    2028: '#CD5C5C',     // indianred
    2029: '#483D8B',     // darkslateblue
    2030: '#BDB76B',     // darkkhaki
    2031: '#008080',     // teal
    getColor: function(year) {
      return this[year] || '#666666'; // fallback to gray
    }
  };
  
  export default colorMap;