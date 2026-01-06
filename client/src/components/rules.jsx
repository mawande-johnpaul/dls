import { useState } from 'react';
import { fetchData } from '../api';
import Modal from './modal';
import { InlineSpinner } from './loading';
import './rules.css';

export default function Rules() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [formData, setFormData] = useState({ reporter_name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const openReportModal = (type) => {
    setReportType(type);
    setIsReportModalOpen(true);
    setMessage({ type: '', text: '' });
    setFormData({ reporter_name: '', description: '' });
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetchData('report', 'POST', {
        type: reportType,
        description: formData.description,
        reporter_name: formData.reporter_name || 'Anonymous'
      });

      setMessage({ type: 'success', text: response.message });
      setFormData({ reporter_name: '', description: '' });

      setTimeout(() => {
        setIsReportModalOpen(false);
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to submit report. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (reportType) {
      case 'player':
        return 'Report a Player';
      case 'rule':
        return 'Suggest a Rule';
      case 'bug':
        return 'Report a Bug';
      default:
        return 'Submit Report';
    }
  };

  const getDescriptionPlaceholder = () => {
    switch (reportType) {
      case 'player':
        return 'Describe the player behavior and provide details...';
      case 'rule':
        return 'Describe your rule suggestion and how it would improve the tournament...';
      case 'bug':
        return 'Describe the bug and steps to reproduce it...';
      default:
        return 'Enter description...';
    }
  };

  return (
    <>
      <section className="rules-page">
        <div className="rules-actions">
          <button 
            className="action report-player"
            onClick={() => openReportModal('player')}
          >
            Report a player
          </button>
          <button 
            className="action suggest-rule"
            onClick={() => openReportModal('rule')}
          >
            Suggest a rule
          </button>
          <button 
            className="action report-bug"
            onClick={() => openReportModal('bug')}
          >
            Report a bug
          </button>
        </div>

        <article className="rules-journal">
          <h1 className="rules-title">Tournament Rules & Regulations</h1>

          <p className="lead">
            These rules govern tournament eligibility, registration, match format,
            player conduct, scoring, disputes and anti-cheat policies. All
            participants must read and agree to these terms before registering.
          </p>

          <section className="rule-section">
            <h2>1. Eligibility & Teams</h2>
            <ol>
              <li>Each team must register under a single captain with valid contact details.</li>
              <li>Team size and substitutes: a team consists of up to 5 starting players and up to 2 substitutes unless otherwise specified.</li>
              <li>Players must not be concurrently registered to multiple teams in the same tournament.</li>
            </ol>
          </section>

          <section className="rule-section">
            <h2>2. Registration & Fees</h2>
            <ol>
              <li>Entry fees must be paid by the published deadline to confirm registration.</li>
              <li>Late registrations may be accepted at organizer discretion with possible surcharge.</li>
            </ol>
          </section>

          <section className="rule-section">
            <h2>3. Match Format & Scheduling</h2>
            <ol>
              <li>Match formats (bo1 / bo3 / round-robin / knockout) are defined per tournament and communicated in the event brief.</li>
              <li>Matches must start at scheduled times. Teams unable to field a match within the allotted grace period forfeit the match.</li>
            </ol>
          </section>

          <section className="rule-section">
            <h2>4. Scoring & Advancement</h2>
            <ol>
              <li>Scoring rules (points, tiebreakers) are defined for each tournament and published in the event page.</li>
              <li>Tiebreakers follow the published order: head-to-head → map difference → points scored.</li>
            </ol>
          </section>

          <section className="rule-section">
            <h2>5. Conduct & Fair Play</h2>
            <ol>
              <li>Abusive, discriminatory, or toxic behavior is prohibited and may result in warnings, suspensions, or bans.</li>
              <li>Cheating, exploiting, or using unauthorized tools is an immediate disqualification.
              Evidence will be reviewed by organizers before final action.</li>
            </ol>
          </section>

          <section className="rule-section">
            <h2>6. Match Reporting & Disputes</h2>
            <ol>
              <li>Match results must be reported by the winning team via the match-reporting flow within the tournament UI.</li>
              <li>Disputes should be submitted with screenshots/logs; organizers may request additional proof.</li>
            </ol>
          </section>

          <section className="rule-section">
            <h2>7. Substitutions & Roster Changes</h2>
            <ol>
              <li>Substitutions are allowed only as specified in the tournament rules and may require prior notification to organizers.</li>
            </ol>
          </section>

          <section className="rule-section">
            <h2>8. Penalties & Appeals</h2>
            <ol>
              <li>Penalties range from warnings to match forfeits and tournament disqualification depending on severity.</li>
              <li>Appeals may be submitted within the stated appeal window; final decisions rest with organizers.</li>
            </ol>
          </section>

          <section className="rule-section">
            <h2>9. Prizes & Payouts</h2>
            <ol>
              <li>Prize distribution and payout timelines are published with the tournament specifics.</li>
            </ol>
          </section>

          <footer className="rules-footer">
            <small>Organizers reserve the right to update rules; changes will be announced on the tournament page.</small>
          </footer>
        </article>
      </section>

      <Modal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setMessage({ type: '', text: '' });
          setFormData({ reporter_name: '', description: '' });
        }}
        title={getModalTitle()}
      >
        <form onSubmit={handleSubmitReport}>
          {message.text && (
            <div className={`${message.type}-message`}>
              {message.text}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="reporter_name">Your Name (Optional)</label>
            <input
              id="reporter_name"
              type="text"
              value={formData.reporter_name}
              onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
              disabled={loading}
              placeholder="Leave blank to report anonymously"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span style={{ color: 'crimson' }}>*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              disabled={loading}
              placeholder={getDescriptionPlaceholder()}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="modal-button modal-button-secondary"
              onClick={() => {
                setIsReportModalOpen(false);
                setMessage({ type: '', text: '' });
                setFormData({ reporter_name: '', description: '' });
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-button modal-button-primary"
              disabled={loading}
            >
              {loading ? <><InlineSpinner /> Submitting...</> : 'Submit'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
