// components/dashboard/settings/qualification-rules.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Save, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { QualificationRule } from "@/lib/services/leads/qualification";

interface QualificationRulesProps {
    businessId: string;
    initialRules: QualificationRule[];
    initialThresholds: {
        high: number;
        medium: number;
    };
}

export default function QualificationRules({
    businessId,
    initialRules,
    initialThresholds,
}: QualificationRulesProps) {
    // ✅ FIX: remove impossible empty-string comparison
    const safeRules = (initialRules || []).filter(
        (rule) => rule.field && rule.condition,
    );

    const [rules, setRules] = useState<QualificationRule[]>(safeRules);
    const [thresholds, setThresholds] = useState(initialThresholds);
    const [isLoading, setIsLoading] = useState(false);

    // New rule form
    const [newRule, setNewRule] = useState<Omit<QualificationRule, "id">>({
        field: "serviceType",
        condition: "contains",
        value: "",
        score: 0,
        tag: "",
    });

    const addRule = () => {
        if (!newRule.value || newRule.value.toString().trim() === "") {
            toast({
                title: "Error",
                description: "Rule value is required",
                variant: "destructive",
            });
            return;
        }

        const rule: QualificationRule = {
            ...newRule,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };

        setRules([...rules, rule]);

        // Reset form
        setNewRule({
            field: "serviceType",
            condition: "contains",
            value: "",
            score: 0,
            tag: "",
        });

        toast({
            title: "Rule added",
            description: "Rule has been added to the list",
        });
    };

    const removeRule = (id: string) => {
        setRules(rules.filter((rule) => rule.id !== id));
    };

    const saveRules = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/businesses/${businessId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    qualification: {
                        rules,
                        priorityThresholds: thresholds,
                    },
                }),
            });

            if (!response.ok) throw new Error("Failed to save rules");

            toast({
                title: "Success",
                description: "Qualification rules saved successfully",
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to save qualification rules",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ FIX: typed options
    const fieldOptions: {
        value: QualificationRule["field"];
        label: string;
    }[] = [
            { value: "serviceType", label: "Service Type" },
            { value: "location", label: "Location" },
            { value: "message", label: "Message" },
            { value: "contactCompleteness", label: "Contact Completeness" },
            { value: "timeOfDay", label: "Time of Day" },
        ];

    const conditionOptions: {
        value: QualificationRule["condition"];
        label: string;
    }[] = [
            { value: "equals", label: "Equals" },
            { value: "contains", label: "Contains" },
            { value: "startsWith", label: "Starts With" },
            { value: "endsWith", label: "Ends With" },
            { value: "regex", label: "Matches Regex" },
            { value: "in", label: "Is In List (comma-separated)" },
            { value: "notEmpty", label: "Is Not Empty" },
        ];

    const getFieldExample = (field: QualificationRule["field"]) => {
        switch (field) {
            case "serviceType":
                return 'e.g., "Emergency Plumbing" or "Web Design"';
            case "location":
                return 'e.g., "New York" or "London"';
            case "message":
                return 'e.g., "urgent" or "ASAP"';
            case "contactCompleteness":
                return "Number 1–4 (1=minimal, 4=complete)";
            case "timeOfDay":
                return "Hour 0–23 (e.g., 9 for 9 AM)";
            default:
                return "";
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lead Qualification Rules</CardTitle>
                <CardDescription>
                    Define rules to automatically score and prioritize incoming leads
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Priority Thresholds */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Priority Thresholds</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>High Priority Score</Label>
                            <Input
                                type="number"
                                value={thresholds.high}
                                onChange={(e) =>
                                    setThresholds({
                                        ...thresholds,
                                        high: parseInt(e.target.value) || 80,
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Medium Priority Score</Label>
                            <Input
                                type="number"
                                value={thresholds.medium}
                                onChange={(e) =>
                                    setThresholds({
                                        ...thresholds,
                                        medium: parseInt(e.target.value) || 60,
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Low Priority</Label>
                            <div className="p-2 border rounded text-center">
                                &lt; {thresholds.medium}
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Add Rule */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Add New Rule</h3>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <Label>Field</Label>
                            <Select
                                value={newRule.field}
                                onValueChange={(value) =>
                                    setNewRule({
                                        ...newRule,
                                        field: value as QualificationRule["field"], // ✅ FIX
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {fieldOptions.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Condition</Label>
                            <Select
                                value={newRule.condition}
                                onValueChange={(value) =>
                                    setNewRule({
                                        ...newRule,
                                        condition: value as QualificationRule["condition"], // ✅ FIX
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {conditionOptions.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Value</Label>
                            <Input
                                value={String(newRule.value)}
                                placeholder={getFieldExample(newRule.field)}
                                onChange={(e) =>
                                    setNewRule({ ...newRule, value: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <Label>Score</Label>
                            <Input
                                type="number"
                                value={newRule.score}
                                onChange={(e) =>
                                    setNewRule({
                                        ...newRule,
                                        score: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <Label>Tag</Label>
                            <Input
                                value={newRule.tag || ""}
                                onChange={(e) =>
                                    setNewRule({ ...newRule, tag: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={addRule}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Rule
                        </Button>
                    </div>
                </div>

                <Separator />

                {/* Existing Rules */}
                <div className="space-y-4">
                    {rules.length === 0 ? (
                        <div className="text-center py-8 border-dashed border rounded">
                            <AlertCircle className="mx-auto mb-2 text-gray-400" />
                            No rules defined
                        </div>
                    ) : (
                        rules.map((rule) => (
                            <div
                                key={rule.id}
                                className="flex justify-between items-start p-4 border rounded"
                            >
                                <div>
                                    <Badge>{rule.field}</Badge>{" "}
                                    <Badge variant="secondary">{rule.condition}</Badge>{" "}
                                    <span>{String(rule.value)}</span>
                                    <div className="mt-1 text-sm">
                                        Score: {rule.score} {rule.tag && `• Tag: ${rule.tag}`}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => removeRule(rule.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={saveRules} disabled={isLoading}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Rules
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
