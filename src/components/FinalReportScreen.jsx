import React from 'react';

export function FinalReportScreen({ state, retryInterview }) {
    const { finalReport } = state;
    if (!finalReport) return null;

    const handleDownload = () => {
        const text = `
InterviewForge AI - Final Report
--------------------------------
Overall Score: ${finalReport.overall_score}/100
Communication: ${finalReport.communication_score}/100
Technical: ${finalReport.technical_score}/100
Confidence: ${finalReport.confidence_score}/100

Readiness: ${finalReport.interview_readiness}

Top Strengths:
${finalReport.top_strengths?.map(s => `- ${s}`).join('\n')}

Critical Gaps:
${finalReport.critical_gaps?.map(s => `- ${s}`).join('\n')}
    `;
        const element = document.createElement("a");
        const file = new Blob([text], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "interview_report.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div id="final-report-screen">
            <h2>Final Report</h2>

            <div className="score-bars" style={{ width: '300px' }}>
                <div style={{ marginBottom: '1rem', background: '#3b494c' }}>
                    <div style={{ width: `${finalReport.overall_score}%`, background: '#00E5FF' }}>Overall: {finalReport.overall_score}%</div>
                </div>
                <div style={{ marginBottom: '1rem', background: '#3b494c' }}>
                    <div style={{ width: `${finalReport.communication_score}%`, background: '#00E5FF' }}>Communication: {finalReport.communication_score}%</div>
                </div>
                <div style={{ marginBottom: '1rem', background: '#3b494c' }}>
                    <div style={{ width: `${finalReport.technical_score}%`, background: '#00E5FF' }}>Technical: {finalReport.technical_score}%</div>
                </div>
                <div style={{ marginBottom: '1rem', background: '#3b494c' }}>
                    <div style={{ width: `${finalReport.confidence_score}%`, background: '#00E5FF' }}>Confidence: {finalReport.confidence_score}%</div>
                </div>
            </div>

            <div className="report-details">
                <h3>Interview Readiness: {finalReport.interview_readiness}</h3>
                <div>
                    <h4>Top Strengths</h4>
                    <ul>{finalReport.top_strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
                <div>
                    <h4>Identified Gaps</h4>
                    <ul>{finalReport.critical_gaps?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
            </div>

            <button id="retry-btn" onClick={retryInterview}>Retry Interview</button>
            <button id="download-btn" onClick={handleDownload}>Download Report</button>
        </div>
    );
}
