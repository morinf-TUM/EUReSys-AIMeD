import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

const SelfChecklist: React.FC = () => {
    // Notified Body Ready Question Set for AI Medical Devices
    const checklistData = [
        {
            id: 1,
            title: "Manufacturer & Governance (MDR Art. 10, 15 / AI Act Art. 16)",
            items: [
                { id: 1, text: "Who is the legal manufacturer?" },
                { id: 2, text: "Who is the AI system provider under the AI Act?" },
                {
                    id: 3,
                    text: "Who has final authority over:",
                    subItems: [
                        { id: 31, text: "Model changes?" },
                        { id: 32, text: "Intended purpose changes?" }
                    ]
                },
                { id: 4, text: "Who is the PRRC, and what is their AI competence?" },
                { id: 5, text: "How are regulatory decisions documented and approved?" },
            ]
        },
        {
            id: 2,
            title: "Intended Purpose & Classification (MDR Annex I / Rule 11 / MDCG 2019-11)",
            items: [
                { id: 1, text: "What is the exact intended purpose statement?" },
                { id: 2, text: "How does the software influence clinical decisions?" },
                { id: 3, text: "What happens if the output is incorrect?" },
                { id: 4, text: "Why does Rule 11 lead to this specific class?" },
                { id: 5, text: "Why is a higher class not applicable?" },
            ]
        },
        {
            id: 3,
            title: "Device Description & Architecture (MDR Annex II §1)",
            items: [
                { id: 1, text: "What are the system boundaries?" },
                { id: 2, text: "What functions are medical vs non-medical?" },
                { id: 3, text: "Where does inference occur?" },
                { id: 4, text: "What third-party software or pretrained models are used?" },
                { id: 5, text: "How are SOUP components controlled?" },
            ]
        },
        {
            id: 4,
            title: "AI Model & Algorithm Control (MDCG AI guidance / AI Act lifecycle controls)",
            items: [
                { id: 1, text: "What type of AI model is used?" },
                { id: 2, text: "Is the model locked at release?" },
                {
                    id: 3,
                    text: "If adaptive:",
                    subItems: [
                        { id: 31, text: "What changes post-market?" },
                        { id: 32, text: "How is safety ensured?" }
                    ]
                },
                { id: 4, text: "How are model versions identified and traced?" },
                { id: 5, text: "What constitutes a significant change?" },
                { id: 6, text: "⚠️ Notified Bodies are allergic to 'continuous improvement' without controls." }
            ]
        },
        {
            id: 5,
            title: "Data Governance & Training (MDR Annex I / AI Act Art. 10)",
            items: [
                { id: 1, text: "Where did the training data come from?" },
                { id: 2, text: "Is it representative of the target population?" },
                { id: 3, text: "How was ground truth established?" },
                { id: 4, text: "How were bias and confounders addressed?" },
                { id: 5, text: "How do you prevent data leakage?" },
            ]
        },
        {
            id: 6,
            title: "Clinical Evaluation & Performance (MDR Art. 61 / Annex XIV)",
            items: [
                { id: 1, text: "What is the claimed clinical benefit?" },
                { id: 2, text: "How is scientific validity demonstrated?" },
                { id: 3, text: "How do analytical and clinical performance differ?" },
                { id: 4, text: "Why is existing evidence sufficient?" },
                { id: 5, text: "Why is a clinical investigation not required (if applicable)?" },
                { id: 6, text: "⚠️ Accuracy metrics without clinical relevance = rejection risk." }
            ]
        },
        {
            id: 7,
            title: "Risk Management & Safety (ISO 14971 + Annex I GSPR)",
            items: [
                { id: 1, text: "What are the AI-specific hazards?" },
                { id: 2, text: "How were misuse and automation bias addressed?" },
                { id: 3, text: "How does the user detect incorrect output?" },
                { id: 4, text: "What is the residual risk acceptability rationale?" },
                { id: 5, text: "How is cybersecurity integrated into risk management?" },
                { id: 6, text: "⚠️ Notified Bodies expect AI risks explicitly named, not implied." }
            ]
        },
        {
            id: 8,
            title: "Human Oversight & Explainability (Annex I + AI Act Art. 14)",
            items: [
                { id: 1, text: "Who is expected to oversee AI outputs?" },
                { id: 2, text: "What actions can the user take if output is questionable?" },
                { id: 3, text: "How is uncertainty communicated?" },
                { id: 4, text: "Why is the level of explainability appropriate?" },
            ]
        },
        {
            id: 9,
            title: "Transparency & Instructions for Use (Annex I Ch. III / AI Act Art. 13)",
            items: [
                { id: 1, text: "How are AI limitations explained to users?" },
                { id: 2, text: "What training is required before use?" },
                { id: 3, text: "Are warnings and contraindications AI-specific?" },
                { id: 4, text: "Is confidence or uncertainty communicated?" },
            ]
        },
        {
            id: 10,
            title: "Post-Market Surveillance & Learning (MDR Art. 83–86 + AI Act monitoring)",
            items: [
                { id: 1, text: "What AI performance metrics are monitored post-market?" },
                { id: 2, text: "How is model drift detected?" },
                { id: 3, text: "What triggers retraining or updates?" },
                { id: 4, text: "How are real-world data fed back into risk management?" },
                { id: 5, text: "How are users informed of AI changes?" },
                { id: 6, text: "⚠️ No quantitative PMS metrics = guaranteed questions." }
            ]
        },
        {
            id: 11,
            title: "Change Management & Updates (MDR significant change guidance)",
            items: [
                { id: 1, text: "What changes require NB notification?" },
                { id: 2, text: "How are updates validated?" },
                { id: 3, text: "How is backward compatibility ensured?" },
                { id: 4, text: "How do you maintain traceability across versions?" },
            ]
        },
        {
            id: 12,
            title: "AI Act Alignment (Forward-Looking) (High-Risk AI conformity)",
            items: [
                { id: 1, text: "How does MDR compliance map to AI Act obligations?" },
                { id: 2, text: "Where are the gaps?" },
                { id: 3, text: "How is post-market monitoring aligned?" },
                { id: 4, text: "Who owns AI Act compliance internally?" },
            ]
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Question Set for AI-enabled Medical Devices
            </Typography>
            <Typography variant="body1" paragraph>
                Below is a set of questions you can use to stress-test an application for a AI-enabled medical 
                device before formal submission to a Notified Body. 
                These should be very close to the questions Notified Bodies will ask. 
                You must be ready to answer them.
            </Typography>

            {checklistData.map((section) => (
                <Paper key={section.id} elevation={2} sx={{ mb: 4, p: 2 }}>
                    <Typography variant="h5" gutterBottom>
                        {section.title}
                    </Typography>
                    <List dense>
                        {section.items.map((item) => (
                            <React.Fragment key={item.id}>
                                <ListItem>
                                    <ListItemText primary={item.text} />
                                </ListItem>
                                {item.subItems && (
                                    <List dense sx={{ pl: 4 }}>
                                        {item.subItems.map((subItem) => (
                                            <ListItem key={subItem.id} sx={{ pl: 2 }}>
                                                <ListItemText primary={subItem.text} />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            ))}

            <Typography variant="body2" color="textSecondary" sx={{ mt: 4 }}>
                Note: This checklist is not meant to be exhaustive, but rather to give you an idea of things to come. 
                It must be completed in relation to your actual compliance requirements.
            </Typography>
        </Box>
    );
};

export default SelfChecklist;


// Key Features:
//  1. Three-level hierarchy:
// • Main sections (Regulatory Compliance, Technical Documentation, Post-Market Activities)
// • Main checklist items within each section
// • Sub-items under each main item

//  2. Clean data structure:
// • The checklistData array contains all the content in a structured format
// • Each item has an id for unique identification
// • Sub-items are nested under their parent items

//  3. Material-UI components:
// • Uses Paper for section containers
// • Uses List and ListItem for the hierarchical display
// • Proper indentation with pl (padding-left) for visual hierarchy

//  4. Easy to modify:
// • Simply edit the checklistData array to add/remove/change items
// • The structure is consistent and predictable
// • Each section, item, and sub-item follows the same pattern


// How to Customize:
//  1. Add a new section: Add another object to the checklistData array
//  2. Add a new item: Add to the items array within a section
//  3. Add a sub-item: Add to the subItems array within an item
//  4. Change text: Modify the text or title properties