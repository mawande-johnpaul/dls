import { useState, useEffect } from "react";
import { fetchData } from "../api";
import Modal from "./modal";
import { LoadingSkeleton, InlineSpinner } from "./loading";
import "./tournaments.css";

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teamPasscode, setTeamPasscode] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamPasscode, setNewTeamPasscode] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // Tournament details view
  const [viewingTournament, setViewingTournament] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [standings, setStandings] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tournamentsData, teamsData] = await Promise.all([
        fetchData("tournaments", "GET"),
        fetchData("teams", "GET"),
      ]);
      setTournaments(tournamentsData);
      setTeams(teamsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTournament = async (tournament) => {
    setViewingTournament(tournament);
    setDetailsLoading(true);
    
    try {
      const [fixturesData, standingsData] = await Promise.all([
        fetchData(`tournaments/${tournament.id}/fixtures`, "GET"),
        fetchData(`standings/${tournament.id}`, "GET"),
      ]);
      setFixtures(fixturesData);
      setStandings(standingsData);
    } catch (error) {
      console.error("Error loading tournament details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleJoinClick = (tournament) => {
    setSelectedTournament(tournament);
    setIsJoinModalOpen(true);
    setMessage({ type: "", text: "" });
    setTeamPasscode("");
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      setMessage({ type: "error", text: "Please enter a team name" });
      return;
    }
    
    if (!newTeamPasscode.trim()) {
      setMessage({ type: "error", text: "Please enter a team passcode" });
      return;
    }

    setJoinLoading(true);
    try {
      const response = await fetchData("teams", "POST", { 
        name: newTeamName,
        passcode: newTeamPasscode
      });
      setTeams([...teams, response]);
      setSelectedTeam(response.id.toString());
      setNewTeamName("");
      setNewTeamPasscode("");
      setIsCreatingTeam(false);
      setMessage({ type: "success", text: "Team created successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to create team",
      });
    } finally {
      setJoinLoading(false);
    }
  };

  const handleJoinTournament = async () => {
    if (!selectedTeam) {
      setMessage({ type: "error", text: "Please select a team" });
      return;
    }

    setJoinLoading(true);
    try {
      const response = await fetchData("join-tournament", "POST", {
        tournament_id: selectedTournament.id,
        team_id: parseInt(selectedTeam),
        passcode: teamPasscode,
      });

      setMessage({ type: "success", text: response.message });

      setTimeout(() => {
        setIsJoinModalOpen(false);
        setSelectedTeam("");
        setTeamPasscode("");
        setMessage({ type: "", text: "" });
        loadData(); // Reload tournaments to update team counts
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to join tournament",
      });
    } finally {
      setJoinLoading(false);
    }
  };

  if (viewingTournament) {
    return (
      <div className="tournaments">
        <button
          className="back-button"
          onClick={() => {
            setViewingTournament(null);
            setFixtures([]);
            setStandings([]);
          }}
        >
          ← Back to Tournaments
        </button>

        <div className="tournament-details">
          <h1>{viewingTournament.title}</h1>
          <div className="tournament-info">
            <p>
              <strong>Entry Fee:</strong> ₦{viewingTournament.entry_fee}
            </p>
            <p>
              <strong>Start:</strong>{" "}
              {new Date(viewingTournament.start_date).toLocaleDateString()}
            </p>
            <p>
              <strong>End:</strong>{" "}
              {new Date(viewingTournament.end_date).toLocaleDateString()}
            </p>
            <p>
              <strong>Teams:</strong> {viewingTournament.team_count}
            </p>
          </div>

          <div className="tournament-tables">
            <div className="fixtures-section">
              <h2>Fixtures</h2>
              {detailsLoading ? (
                <LoadingSkeleton type="card" count={1} />
              ) : fixtures.length > 0 ? (
                <table className="fixtures-table">
                  <thead>
                    <tr>
                      <th>Team A</th>
                      <th>vs</th>
                      <th>Team B</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fixtures.map((fixture) => (
                      <tr
                        key={fixture.id}
                        className={fixture.is_completed ? "completed" : ""}
                      >
                        <td>{fixture.team_a.name}</td>
                        <td>vs</td>
                        <td>{fixture.team_b.name}</td>
                        <td>
                          {new Date(fixture.scheduled_time).toLocaleDateString()}
                        </td>
                        <td>{fixture.location}</td>
                        <td>{fixture.result || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No fixtures scheduled yet</p>
              )}
            </div>

            <div className="standings-section">
              <h2>Standings</h2>
              {detailsLoading ? (
                <LoadingSkeleton type="card" count={1} />
              ) : standings.length > 0 ? (
                <table className="standings-table">
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
                    {standings.map((standing) => (
                      <tr key={standing.team_id}>
                        <td>{standing.rank}</td>
                        <td>{standing.team_name}</td>
                        <td>{standing.played}</td>
                        <td>{standing.wins}</td>
                        <td>
                          <strong>{standing.points}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No standings data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tournaments">
      <div className="tournaments-display">
        <div className="participating">
          <h1>My tournaments</h1>
          <div className="participating-content">
            <p>You have not joined any tournaments</p>
            <button onClick={() => setIsJoinModalOpen(true)}>
              Join a tournament
            </button>
          </div>
        </div>
        <div className="open">
          <h1>Open Tournaments</h1>
          <div className="announcement-items">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <LoadingSkeleton key={i} type="card" count={1} />
                ))}
              </>
            ) : tournaments.length > 0 ? (
              tournaments.map((tournament) => (
                <article key={tournament.id} className="tournament-card">
                  <h2 className="tournament-title">{tournament.title}</h2>
                  <div className="tournament-meta">
                    <strong className="entry">₦{tournament.entry_fee}</strong>
                    <div className="dates">
                      <span>
                        Start:{" "}
                        {new Date(tournament.start_date).toLocaleDateString()}
                      </span>
                      <span>
                        End: {new Date(tournament.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="teams">
                    <h3>Teams ({tournament.team_count})</h3>
                    <div className="team-items">
                      {tournament.teams.slice(0, 5).map((team) => (
                        <div key={team.id} className="team-item">
                          <p>{team.name}</p>
                        </div>
                      ))}
                      {tournament.team_count > 5 && (
                        <div className="team-item">
                          <p>+{tournament.team_count - 5} more</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="tournament-actions">
                    <button
                      className="view-tournament-btn"
                      onClick={() => handleViewTournament(tournament)}
                    >
                      View Details
                    </button>
                    <button
                      className="join-tournament-btn"
                      onClick={() => handleJoinClick(tournament)}
                    >
                      Join Tournament
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p>No open tournaments available</p>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => {
          setIsJoinModalOpen(false);
          setSelectedTournament(null);
          setSelectedTeam("");
          setTeamPasscode("");
          setIsCreatingTeam(false);
          setMessage({ type: "", text: "" });
        }}
        title={
          selectedTournament
            ? `Join ${selectedTournament.title}`
            : "Join Tournament"
        }
      >
        {message.text && (
          <div className={`${message.type}-message`}>{message.text}</div>
        )}

        {!isCreatingTeam ? (
          <>
            <div className="form-group">
              <label htmlFor="team-select">Select Your Team</label>
              <select
                id="team-select"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                disabled={joinLoading}
              >
                <option value="">-- Choose a team --</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTeam && (
              <div className="form-group">
                <label htmlFor="team-passcode">Team Passcode</label>
                <input
                  id="team-passcode"
                  type="password"
                  value={teamPasscode}
                  onChange={(e) => setTeamPasscode(e.target.value)}
                  placeholder="Enter team passcode to join"
                  disabled={joinLoading}
                />
              </div>
            )}

            <p style={{ textAlign: "center", margin: "15px 0", color: "#888" }}>
              Don't have a team?
            </p>
            <button
              className="modal-button modal-button-secondary"
              style={{ width: "100%" }}
              onClick={() => setIsCreatingTeam(true)}
              disabled={joinLoading}
            >
              Create New Team
            </button>

            <div className="modal-footer">
              <button
                className="modal-button modal-button-secondary"
                onClick={() => {
                  setIsJoinModalOpen(false);
                  setSelectedTournament(null);
                  setSelectedTeam("");
                  setTeamPasscode("");
                  setMessage({ type: "", text: "" });
                }}
                disabled={joinLoading}
              >
                Cancel
              </button>
              <button
                className="modal-button modal-button-primary"
                onClick={handleJoinTournament}
                disabled={joinLoading || !selectedTeam}
              >
                {joinLoading ? (
                  <>
                    <InlineSpinner /> Joining...
                  </>
                ) : (
                  "Join Tournament"
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="team-name">Team Name</label>
              <input
                id="team-name"
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
                disabled={joinLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-team-passcode">Team Passcode</label>
              <input
                id="new-team-passcode"
                type="password"
                value={newTeamPasscode}
                onChange={(e) => setNewTeamPasscode(e.target.value)}
                placeholder="Create a secure passcode for your team"
                disabled={joinLoading}
              />
              <small style={{ color: "#888", fontSize: "12px" }}>
                Members will need this passcode to join your team
              </small>
            </div>

            <div className="modal-footer">
              <button
                className="modal-button modal-button-secondary"
                onClick={() => {
                  setIsCreatingTeam(false);
                  setNewTeamName("");
                  setNewTeamPasscode("");
                  setMessage({ type: "", text: "" });
                }}
                disabled={joinLoading}
              >
                Back
              </button>
              <button
                className="modal-button modal-button-primary"
                onClick={handleCreateTeam}
                disabled={joinLoading}
              >
                {joinLoading ? (
                  <>
                    <InlineSpinner /> Creating...
                  </>
                ) : (
                  "Create Team"
                )}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
