import { useEffect, useState } from 'react';
import { fetchData } from '../api';
import { LoadingSkeleton } from './loading';

export default function Standings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchData('standings', 'GET')
      .then((data) => {
        setStandings(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching standings:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="standings">
      <h2>Standings</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>Played</th>
            <th>Wins</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td><LoadingSkeleton type="text" count={1} /></td>
                  <td><LoadingSkeleton type="text" count={1} /></td>
                  <td><LoadingSkeleton type="text" count={1} /></td>
                  <td><LoadingSkeleton type="text" count={1} /></td>
                  <td><LoadingSkeleton type="text" count={1} /></td>
                </tr>
              ))}
            </>
          ) : standings.length > 0 ? (
            standings.map((standing) => (
              <tr key={standing.team_id}>
                <td>{standing.rank}</td>
                <td>{standing.team_name}</td>
                <td>{standing.played}</td>
                <td>{standing.wins}</td>
                <td>{standing.points}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>
                No standings data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
