import React, { useState } from 'react';

const Huoltokirja = () => {
  // Vakiotoimenpiteet kausittain
  const DEFAULT_MAINTENANCE = [
  { season: 'Kevät', tasks: [
    'Ilmanvaihdon toiminnan tarkkailu',
    'Lämmityksen kesäsulku kiinni / lämmityksen sulkeminen kesäksi',
    'Ilmanvaihdon venttiilien / -koneen kesäasetukset ja asetusarvot',
    'Ilmanvaihtokoneen ja ilmanvaihtoventtiilien puhdistus ja suodattimien vaihto',
    'Lämpöpumppujen kondenssiveden poiston toiminnan tarkastus ja ohjaus',
    'Aurinkopaneelijärjestelmän toiminnan seuranta',
    'Katon ja sen läpivientien tarkastus',
    'Katoturvatuotteiden tarkastus',
    'Salaoja- ja sadevesiviemäreiden toiminnan tarkastus',
    'Pintavesien tarkkailu',
  ]},
  { season: 'Kesä', tasks: [
    'Ilmanvaihdon toiminnan tarkkailu',
    'Lämmitysjärjestelmän tarkastaminen / huollattaminen / huolto',
    'Tulisijan puhdistus, piipun nuohous',
    'Lämpöpumppujen puhdistus (myös lämmityspiiri)',
    'Liesituulettimen rasvasuodattimen puhdistus ja vaihto',
    'Kylmälaitteiden ja lieden taustojen puhdistus',
    'Vikavirtasuojien testaus (2 krt/vuosi)',
  ]},
  { season: 'Syksy', tasks: [
    'Ilmanvaihdon toiminnan tarkkailu',
    'Patterien termostaattien toimivuuden tarkastus',
    'Ilmanvaihdon venttiilien talviasetukset',
    'Ilmanvaihtokoneiden talviasetukset ja suodattimien vaihdot',
    'Lämmitysjärjestelmien paisunta-astian esipaineen tarkastus',
    'Ilmalämpöpumpun sisä- ja ulkoyksikön puhdistus',
    'Ulkovalaistuksen kunnon tarkastus',
    'Rännien ja rännikaivojen puhdistus',
  ]},
  { season: 'Talvi', tasks: [
    'Ilmanvaihdon toiminnan tarkkailu',
    'Lämmityksen toiminnan tarkastus',
    'Palohälyttimien ja häkävaroittimien vuositestaus',
    'Vesihanojen ja WC-istuinten kunnon tarkastus',
    'Vesilukkojen ja lattiakaivojen puhdistus',
    'Pesukoneiden letkujen tarkastus ja tarvittaessa vaihto',
    'Katon lumikuorman (ja jääpuikkojen) tarkkailu, liukkauden torjunta',
    'Lämpöpumppujen ulkoyksiköiden tarkastus ja jäänpoisto',
    'Vikavirtasuojien testaus (2 krt/vuosi)',
  ]},
];


  // 10 vuoden aikajänne nykyvuodesta
  const currentYear = new Date().getFullYear();
  const getYearRange = (start, len = 10) => Array.from({length: len}, (_, i) => start + i);
  const [calendarChecks, setCalendarChecks] = useState({});
  const getTaskKey = (season, task) => `${season}__${task}`;
  const handleCalendarCheck = (taskKey, year) => {
    setCalendarChecks(prev => ({
      ...prev,
      [taskKey]: {
        ...prev[taskKey],
        [year]: !prev[taskKey]?.[year]
      }
    }));
  };
  const yearRange = getYearRange(currentYear, 10);
  const renderMaintenanceCalendar = () => (
    <div style={{overflowX: 'auto', marginBottom: 32}}>
      <table border="1" cellPadding="4" style={{borderCollapse: 'collapse', width: '100%', background: 'white'}}>
        <thead style={{background: '#f8f9fa'}}>
          <tr>
            <th style={{minWidth: 180}}>Kausi / Toimenpide</th>
            {yearRange.map(year => (
              <th key={year} style={{textAlign: 'center'}}>{year}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DEFAULT_MAINTENANCE.map(({season, tasks}) => ([
            <tr key={season} style={{background: '#f3f6fa'}}>
              <td colSpan={yearRange.length + 1} style={{fontWeight: 600}}>{season}</td>
            </tr>,
            ...tasks.map(task => {
              const taskKey = getTaskKey(season, task);
              return (
                <tr key={taskKey}>
                  <td>{task}</td>
                  {yearRange.map(year => (
                    <td key={year} style={{textAlign: 'center'}}>
                      <input
                        type="checkbox"
                        checked={!!calendarChecks[taskKey]?.[year]}
                        onChange={() => handleCalendarCheck(taskKey, year)}
                        style={{width: 18, height: 18, accentColor: calendarChecks[taskKey]?.[year] ? '#198754' : '#0d6efd'}}
                      />
                    </td>
                  ))}
                </tr>
              );
            })
          ]))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="py-4" style={{padding: 24}}>
      <h2 className="h3 mb-3">Vuosihuoltokalenteri</h2>
      <p className="mb-4">Merkitse vuosittain tehdyt huoltotoimenpiteet. Voit lisätä myös omia rivejä jatkossa.</p>
      {renderMaintenanceCalendar()}
    </div>
  );
};


export default Huoltokirja;
